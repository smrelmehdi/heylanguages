import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;

let assetModuleId = 0;
const assetPaths = new Map<number, string>();
const extensions = (Module as typeof Module & {
  _extensions: Record<string, (module: { exports: unknown }, filename: string) => void>;
})._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg', '.webp']) {
  extensions[extension] = (module, filename) => {
    assetModuleId += 1;
    assetPaths.set(assetModuleId, filename);
    module.exports = assetModuleId;
  };
}

const moduleLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleLoader._load;
moduleLoader._load = function loadForOfflineTests(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: { getItem: async () => null, setItem: async () => {} } };
  }
  if (request === 'expo-asset') {
    return {
      Asset: {
        fromModule: (assetId: number) => ({
          hash: `asset-${assetId}`,
          name: `asset-${assetId}`,
          type: 'mp3',
          uri: assetPaths.get(assetId) ?? `bundle://${assetId}`,
          localUri: assetPaths.get(assetId) ?? `bundle://${assetId}`,
          downloadAsync: async () => {},
        }),
      },
    };
  }
  if (request === 'expo-file-system/legacy') {
    return {
      documentDirectory: 'file:///documents/',
      getInfoAsync: async () => ({ exists: false }),
      readDirectoryAsync: async () => [],
      makeDirectoryAsync: async () => {},
      copyAsync: async () => {},
      moveAsync: async () => {},
      deleteAsync: async () => {},
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const offline = require('../utils/offline-pack') as typeof import('../utils/offline-pack');

type TestRuntime = ReturnType<typeof createTestRuntime>;

function createTestRuntime() {
  const storageValues = new Map<string, string>();
  const files = new Map<string, number>([
    ['bundle://1', 100],
    ['bundle://2', 200],
  ]);
  const assetDownloads = new Map<number, number>();
  const logs: Array<{ event: string; detail: Record<string, unknown> }> = [];
  let failAssetTwoCopyOnce = false;

  const runtime: import('../utils/offline-pack').OfflinePackRuntime = {
    documentDirectory: 'file:///documents/',
    storage: {
      getItem: async key => storageValues.get(key) ?? null,
      setItem: async (key, value) => { storageValues.set(key, value); },
    },
    assetFromModule: assetId => ({
      hash: `hash-${assetId}`,
      name: `audio-${assetId}`,
      type: 'mp3',
      uri: `bundle://${assetId}`,
      localUri: `bundle://${assetId}`,
      downloadAsync: async () => {
        assetDownloads.set(assetId, (assetDownloads.get(assetId) ?? 0) + 1);
      },
    }),
    getInfo: async uri => files.has(uri)
      ? { exists: true, size: files.get(uri) }
      : { exists: false },
    readDirectory: async uri => [...files.keys()]
      .filter(file => file.startsWith(uri))
      .map(file => file.slice(uri.length))
      .filter(file => file && !file.includes('/')),
    makeDirectory: async () => {},
    copy: async (from, to) => {
      if (failAssetTwoCopyOnce && from === 'bundle://2') {
        failAssetTwoCopyOnce = false;
        throw new Error('simulated copy failure');
      }
      const size = files.get(from);
      if (!size) throw new Error(`missing source ${from}`);
      files.set(to, size);
    },
    move: async (from, to) => {
      const size = files.get(from);
      if (!size) throw new Error(`missing temporary file ${from}`);
      files.set(to, size);
      files.delete(from);
    },
    remove: async uri => {
      files.delete(uri);
      if (uri.endsWith('/')) {
        [...files.keys()].filter(key => key.startsWith(uri)).forEach(key => files.delete(key));
      }
    },
    now: () => new Date('2026-07-31T12:00:00.000Z'),
    log: (event, detail) => logs.push({ event, detail }),
  };

  return {
    runtime,
    storageValues,
    files,
    assetDownloads,
    logs,
    failNextAssetTwoCopy: () => { failAssetTwoCopyOnce = true; },
  };
}

function manifest(
  dialect: import('../utils/offline-pack').OfflineDialect,
  files: import('../utils/offline-pack').OfflinePackManifestFile[] = [
    { assetId: 1, logicalPath: 'assets/audio/test/1.mp3' },
    { assetId: 2, logicalPath: 'assets/audio/test/2.mp3' },
  ],
  version = 2,
): import('../utils/offline-pack').OfflinePackManifest {
  return {
    dialect,
    version,
    manifestId: `${dialect}-v${version}-${files.length}`,
    expectedBytes: files.length === 0 ? 0 : 300,
    files,
  };
}

const getManifest = (dialect: import('../utils/offline-pack').OfflineDialect) => manifest(dialect);

async function testDownloadLifecycle() {
  const test = createTestRuntime();
  const manager = offline.createOfflinePackManager(test.runtime, getManifest);
  const progress: Array<[number, number]> = [];
  const record = await manager.download('gulf', true, state => {
    progress.push([state.completed, state.total]);
  });

  assert.equal(record.downloaded, true);
  assert.equal(record.downloadedFileCount, 2);
  assert.equal(record.totalBytes, 300);
  assert.deepEqual(progress[0], [0, 2]);
  assert.ok(progress.some(([completed]) => completed === 1));
  assert.deepEqual(progress.at(-1), [2, 2]);
  assert.equal(test.assetDownloads.get(1), 1);
  assert.equal(test.assetDownloads.get(2), 1);
  assert.equal([...test.files.keys()].some(uri => uri.includes('/offline-audio/egyptian/')), false);
  assert.equal([...test.files.keys()].some(uri => uri.includes('/offline-audio/msa/')), false);

  const afterRestart = offline.createOfflinePackManager(test.runtime, getManifest);
  const hydrated = await afterRestart.load();
  assert.equal(hydrated.gulf.downloaded, true);
  assert.equal(hydrated.gulf.downloadedFileCount, 2);

  const resolved = await afterRestart.resolve(1);
  assert.equal(typeof resolved, 'object');
  assert.match((resolved as { uri: string }).uri, /^file:\/\/\/documents\/offline-audio\/gulf\/hash-1-[a-f0-9]+\.mp3$/);

  await afterRestart.remove('gulf');
  const removed = await afterRestart.load();
  assert.equal(removed.gulf.downloaded, false);
  assert.equal(removed.gulf.downloadedFileCount, 0);
  assert.equal([...test.files.keys()].some(uri => uri.startsWith('file:///documents/offline-audio/gulf/')), false);
}

async function testGatingAvailabilityAndDuplicateTaps() {
  const freeTest = createTestRuntime();
  const freeManager = offline.createOfflinePackManager(freeTest.runtime, getManifest);
  await assert.rejects(freeManager.download('gulf', false), /members-only/);
  assert.equal(freeTest.assetDownloads.size, 0);

  const emptyManager = offline.createOfflinePackManager(
    createTestRuntime().runtime,
    dialect => manifest(dialect, []),
  );
  await assert.rejects(emptyManager.download('msa', true), /not available/);

  const duplicateTest = createTestRuntime();
  const duplicateManager = offline.createOfflinePackManager(duplicateTest.runtime, getManifest);
  const first = duplicateManager.download('egyptian', true);
  const duplicate = duplicateManager.download('egyptian', true);
  assert.equal(first, duplicate);
  await Promise.all([first, duplicate]);
  assert.equal(duplicateTest.assetDownloads.get(1), 1);
  assert.equal(duplicateTest.assetDownloads.get(2), 1);
}

async function testPartialRetryUpdateAndExpiration() {
  const test = createTestRuntime();
  test.failNextAssetTwoCopy();
  const manager = offline.createOfflinePackManager(test.runtime, getManifest);
  await assert.rejects(manager.download('msa', true), /incomplete/);
  const partial = await manager.load();
  assert.equal(partial.msa.downloaded, false);
  assert.equal(partial.msa.downloadedFileCount, 1);

  const completed = await manager.download('msa', true);
  assert.equal(completed.downloaded, true);
  assert.equal(completed.downloadedFileCount, 2);
  assert.equal(test.assetDownloads.get(1), 1, 'valid partial file should be reused');
  assert.equal(test.assetDownloads.get(2), 2, 'failed file should be retried');

  const stale = { ...completed, version: completed.version - 1 };
  assert.equal(manager.isUpdateAvailable('msa', stale), true);
  assert.equal(manager.isUpdateAvailable('msa', completed), false);

  // Premium status is deliberately absent from hydration/removal APIs. Expiration gates use,
  // but does not mutate or delete a verified local pack.
  const afterPremiumExpiration = offline.createOfflinePackManager(test.runtime, getManifest);
  assert.equal((await afterPremiumExpiration.load()).msa.downloaded, true);
}

async function main() {
  const expected = {
    gulf: { files: 958, bytes: 22_798_590 },
    egyptian: { files: 744, bytes: 16_659_640 },
    msa: { files: 652, bytes: 20_028_154 },
  } as const;
  for (const dialect of ['gulf', 'egyptian', 'msa'] as const) {
    const info = offline.getOfflineDialectManifestInfo(dialect);
    const manifestFiles = offline.getOfflineDialectManifest(dialect).files;
    const physicalPaths = manifestFiles.map(file => assetPaths.get(file.assetId));
    assert.equal(info.available, true);
    assert.equal(info.fileCount, expected[dialect].files);
    assert.equal(info.expectedBytes, expected[dialect].bytes);
    assert.equal(physicalPaths.every(path => Boolean(path && existsSync(path))), true);
    assert.equal(
      physicalPaths.reduce((total, path) => total + (path ? statSync(path).size : 0), 0),
      expected[dialect].bytes,
    );
  }

  const profile = readFileSync('app/(tabs)/profile.tsx', 'utf8');
  const context = readFileSync('contexts/ConnectivityContext.tsx', 'utf8');
  const layout = readFileSync('app/_layout.tsx', 'utf8');
  const tts = readFileSync('utils/tts.ts', 'utf8');
  assert.match(profile, /onPress=\{\(\) => handleDownloadPack\(dialect\.id\)\}/);
  assert.match(profile, /Downloading \$\{downloadState\.completed\} of \$\{downloadState\.total\}/);
  assert.match(profile, /Offline pack not available yet/);
  assert.match(context, /downloadOfflineDialectPack\(dialect, isPremium/);
  assert.match(layout, /<ConnectivityProvider>/);
  assert.match(layout, /<OfflineGate \/>/);
  assert.match(tts, /resolveOfflineAudioSource\(source\)/);

  await testDownloadLifecycle();
  await testGatingAvailabilityAndDuplicateTaps();
  await testPartialRetryUpdateAndExpiration();
  console.log('Offline pack regression tests passed (14 scenarios).');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
