import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const { PNG } = require('pngjs') as {
  PNG: { sync: { read: (bytes: Buffer) => { width: number; height: number; data: Buffer } } };
};

const root = process.cwd();
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const resolved = JSON.parse(execFileSync('npx', ['expo', 'config', '--type', 'public', '--json'], {
  cwd: root,
  encoding: 'utf8',
}));
const resolvedAndroidPermissions: string[] = resolved.android?.permissions ?? [];

type PngAudit = {
  width: number;
  height: number;
  hasTransparency: boolean;
  paddingRatios: [number, number, number, number];
  maximumRadiusRatio: number;
  visibleRgbColors: Set<string>;
  sha256: string;
};

function auditPng(relativePath: string): PngAudit {
  const bytes = fs.readFileSync(path.resolve(root, relativePath));
  const png = PNG.sync.read(bytes);
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let hasTransparency = false;
  let maximumRadius = 0;
  const visibleRgbColors = new Set<string>();
  const centerX = (png.width - 1) / 2;
  const centerY = (png.height - 1) / 2;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const alpha = png.data[offset + 3];
      if (alpha < 255) hasTransparency = true;
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maximumRadius = Math.max(maximumRadius, Math.hypot(x - centerX, y - centerY));
      visibleRgbColors.add(`${png.data[offset]},${png.data[offset + 1]},${png.data[offset + 2]}`);
    }
  }

  assert.notEqual(maxX, -1, `${relativePath} contains visible artwork`);
  return {
    width: png.width,
    height: png.height,
    hasTransparency,
    paddingRatios: [
      minX / png.width,
      minY / png.height,
      (png.width - 1 - maxX) / png.width,
      (png.height - 1 - maxY) / png.height,
    ],
    maximumRadiusRatio: maximumRadius / Math.min(png.width, png.height),
    visibleRgbColors,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

assert.equal(app.name, 'HeyYusuf');
assert.equal(app.slug, 'heyyusuf');
assert.equal(app.android.package, 'com.heylanguages.heyyusuf');
assert.match(app.version, /^\d+\.\d+\.\d+$/);
assert.equal(Number.isInteger(app.android.versionCode) && app.android.versionCode > 0, true);
assert.equal(eas.cli.appVersionSource, 'remote');
assert.equal(eas.build.production.autoIncrement, true);
assert.equal(eas.build.production.environment, 'production');
assert.equal(eas.build.preview.environment, 'preview');
assert.equal(eas.build.preview.distribution, 'internal');
assert.equal(eas.build.preview.android.buildType, 'apk');
assert.equal('android' in eas.build.production, false, 'production uses the default Play Store AAB output');
assert.deepEqual(Object.keys(eas.build.production.env), ['EXPO_PUBLIC_APP_ENV']);
assert.equal(eas.build.production.env.EXPO_PUBLIC_APP_ENV, 'production');

assert.equal(resolvedAndroidPermissions.includes('android.permission.RECORD_AUDIO'), true);
assert.equal(resolvedAndroidPermissions.includes('android.permission.INTERNET'), false, 'INTERNET is supplied by Android dependencies');
assert.equal(app.android.allowBackup, false);
assert.notEqual(app.android.usesCleartextTraffic, true, 'production cleartext traffic is not enabled');
assert.notEqual(resolved.android?.usesCleartextTraffic, true, 'resolved production config does not enable cleartext traffic');
const blocked = new Set(app.android.blockedPermissions);
for (const permission of [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
]) assert.equal(blocked.has(permission), true, `${permission} is blocked`);
for (const dangerous of [
  'android.permission.MANAGE_EXTERNAL_STORAGE', 'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO', 'android.permission.READ_MEDIA_AUDIO',
  'android.permission.CAMERA', 'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS', 'android.permission.READ_PHONE_STATE',
  'android.permission.QUERY_ALL_PACKAGES', 'android.permission.REQUEST_INSTALL_PACKAGES',
]) assert.equal(resolvedAndroidPermissions.includes(dangerous), false, `${dangerous} is absent`);

const audioPlugin = app.plugins.find((plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-audio');
assert.ok(audioPlugin, 'expo-audio plugin is configured');
assert.match(audioPlugin[1].microphonePermission, /pronunciation evaluation/i);

for (const relativePath of [
  app.icon,
  app.android.adaptiveIcon.foregroundImage,
  app.android.adaptiveIcon.monochromeImage,
  app.web.favicon,
  app.plugins.find((plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen')[1].image,
]) {
  const resolved = path.resolve(root, relativePath);
  assert.equal(fs.existsSync(resolved), true, `${relativePath} exists`);
  assert.doesNotMatch(relativePath, /placeholder|example/i);
}

const splashPlugin = app.plugins.find((plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen');
assert.ok(splashPlugin, 'expo-splash-screen plugin is configured');
const splashAudit = auditPng(splashPlugin[1].image);
assert.deepEqual([splashAudit.width, splashAudit.height], [1024, 1024]);
assert.equal(splashAudit.hasTransparency, true, 'splash artwork has a transparent canvas');
assert.equal(splashAudit.paddingRatios.every(ratio => ratio >= 0.25), true, 'splash artwork has generous padding');
assert.notEqual(
  splashAudit.sha256,
  '186b25701f41b43a88f288cc7af2fe80089e3fcd6a885484e42de8531d6acb29',
  'the configured Expo template splash is not present',
);

const adaptiveAudit = auditPng(app.android.adaptiveIcon.foregroundImage);
assert.equal(adaptiveAudit.hasTransparency, true, 'adaptive foreground has transparency');
assert.equal(adaptiveAudit.paddingRatios.every(ratio => ratio >= 0.20), true, 'adaptive artwork stays inside the safe zone');
assert.equal(adaptiveAudit.maximumRadiusRatio <= 33 / 108, true, 'adaptive artwork stays inside Android universal safe circle');

const monochromeAudit = auditPng(app.android.adaptiveIcon.monochromeImage);
assert.equal(monochromeAudit.hasTransparency, true, 'monochrome icon has a transparent background');
assert.equal(monochromeAudit.paddingRatios.every(ratio => ratio >= 0.20), true, 'monochrome artwork stays inside the safe zone');
assert.equal(monochromeAudit.maximumRadiusRatio <= 33 / 108, true, 'monochrome artwork stays inside Android universal safe circle');
assert.equal(monochromeAudit.visibleRgbColors.size, 1, 'monochrome icon has one visible RGB color');

const productionFacingConfig = JSON.stringify({ app, resolved, eas: eas.build });
assert.doesNotMatch(productionFacingConfig, /localhost|127\.0\.0\.1|http:\/\//i);
assert.doesNotMatch(productionFacingConfig, /SUPABASE_SERVICE_ROLE|OPENAI_API_KEY|ELEVENLABS_API_KEY|sk_[A-Za-z0-9]/i);
assert.equal('expo-notifications' in packageJson.dependencies, false, 'notifications are not enabled');

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
assert.doesNotMatch(tracked, /\.(?:jks|keystore|p12|p8|pem|key)$/im);
assert.doesNotMatch(tracked, /android\/app\/src\/main\/AndroidManifest\.xml/);

const accessSource = fs.readFileSync(path.join(root, 'utils/access.ts'), 'utf8');
assert.match(accessSource, /CAN_USE_INTERNAL_TESTING_ACCESS = IS_LOCAL_DEV/);
assert.match(accessSource, /IS_LOCAL_DEV = [^;]*\.__DEV__ === true/);
const legal = JSON.parse(JSON.stringify(require('../utils/legal').LEGAL_CONFIG));
for (const key of ['privacyPolicyUrl', 'termsOfUseUrl', 'accountDeletionUrl']) {
  assert.match(legal[key], /^https:\/\//);
}

for (const sourceFile of ['app/index.tsx', 'app/lesson.tsx', 'app/chat-conversation.tsx']) {
  const source = fs.readFileSync(path.join(root, sourceFile), 'utf8');
  assert.doesNotMatch(source, /useEffect\(\(\) => \{[\s\S]{0,180}requestRecordingPermissionsAsync/,
    `${sourceFile} does not request microphone permission on mount`);
}

console.log('Android release configuration tests passed (identity, permissions, backup, assets, environment, secrets).');
