/* eslint-disable @typescript-eslint/no-var-requires, no-console */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const ASSET_RE = /\.(png|jpe?g|webp|gif|svg|mp3|wav|m4a|ttf|otf)$/i;
const Module: any = require('module');
const realRequire = Module.prototype.require;

if (!Module.prototype.__heyYusufScenarioImageAuditHook) {
  Module.prototype.require = function (id: string) {
    if (typeof id === 'string' && ASSET_RE.test(id)) {
      return resolve(dirname(this.filename), id);
    }
    return realRequire.call(this, id);
  };
  Module.prototype.__heyYusufScenarioImageAuditHook = true;
}

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

const { getDialectContent } = require('../data/content-registry');
const { getDialectCurriculumItems, resolveContent } = require('../utils/content-resolver');
const { getEgyptianSceneImageIds } = require('../data/egyptian-scene-images');

const content = getDialectContent('egyptian');
const scenarios = getDialectCurriculumItems('egyptian')
  .filter((item: any) => item.contentType === 'scenario');
const dedicatedRoutes = new Set([
  '/scenario-intro?type=Cafe',
  '/scenario-intro-taxi',
  '/scenario-intro-hotel',
  '/scenario-intro-restaurant',
  '/scenario-intro-supermarket',
  '/scenario-intro-pharmacy',
  '/scenario-intro-barbershop',
  '/scenario-intro-airport',
]);

function assetPath(id: string) {
  const value = content.sceneImages[id];
  return typeof value === 'string' ? relative(ROOT, value) : null;
}

const rows = scenarios.map((item: any) => {
  const expected = getEgyptianSceneImageIds(item.contentId);
  const resolved = resolveContent({
    dialect: 'egyptian',
    unitId: item.unitId,
    contentId: item.contentId,
    contentType: 'scenario',
  });
  const entranceAsset = assetPath(item.sceneEntranceImageId);
  const interiorAsset = assetPath(item.sceneImageId);
  return {
    unit: Number(item.unitId.replace('unit-', '')),
    contentId: item.contentId,
    title: item.title,
    scenarioType: item.scenarioName,
    route: item.route,
    introRoute: item.homeHref,
    introType: dedicatedRoutes.has(item.homeHref) ? 'dedicated' : 'shared',
    entranceId: item.sceneEntranceImageId,
    entranceExpectedPath: expected.entrancePath,
    entranceResolvedPath: entranceAsset,
    entranceExists: existsSync(resolve(ROOT, expected.entrancePath)),
    interiorId: item.sceneImageId,
    interiorExpectedPath: expected.interiorPath,
    interiorResolvedPath: interiorAsset,
    interiorExists: existsSync(resolve(ROOT, expected.interiorPath)),
    resolverUsesInteriorId: interiorAsset
      ? resolved?.sceneImage === content.sceneImages[item.sceneImageId]
      : null,
    gulfFallback: [entranceAsset, interiorAsset].some(path => path?.includes('/dubai-') || path?.includes('dubai-')),
  };
});

const otherDialectCairoIds = ['gulf', 'msa'].flatMap(dialect =>
  getDialectCurriculumItems(dialect)
    .filter((item: any) => item.contentType === 'scenario')
    .flatMap((item: any) => [item.sceneImageId, item.sceneEntranceImageId])
    .filter((id: unknown): id is string => typeof id === 'string' && id.startsWith('cairo-'))
    .map((id: string) => ({ dialect, id })),
);

const missing = rows.flatMap((row: any) => [
  ...(!row.entranceExists ? [row.entranceExpectedPath] : []),
  ...(!row.interiorExists ? [row.interiorExpectedPath] : []),
]);
const imageUseCounts: Record<string, number> = rows.flatMap((row: any) => [row.entranceId, row.interiorId])
  .reduce((uses: Record<string, number>, id: string) => {
    uses[id] = (uses[id] ?? 0) + 1;
    return uses;
  }, {} as Record<string, number>);
const sharedImageIds = Object.entries(imageUseCounts as Record<string, number>)
  .filter(([, uses]) => uses > 1);
const registryPaths = Object.entries(content.sceneImages)
  .reduce((paths: Record<string, string[]>, [id, value]) => {
    if (typeof value !== 'string') return paths;
    const path = relative(ROOT, value);
    paths[path] = [...(paths[path] ?? []), id];
    return paths;
  }, {});
const duplicateRegistryMappings = Object.entries(registryPaths)
  .filter(([, ids]) => ids.length > 1)
  .map(([path, ids]) => ({ path, ids }));
const failures = {
  unexpectedScenarioCount: rows.length !== 38,
  unexpectedImageIds: rows.filter((row: any) => {
    const expected = getEgyptianSceneImageIds(row.contentId);
    return row.entranceId !== expected.entranceId || row.interiorId !== expected.interiorId;
  }).map((row: any) => row.contentId),
  directScenarioRoutes: rows.filter((row: any) => !row.introRoute.startsWith('/scenario-intro')).map((row: any) => row.contentId),
  resolverMismatches: rows.filter((row: any) => row.resolverUsesInteriorId === false).map((row: any) => row.contentId),
  gulfFallbacks: rows.filter((row: any) => row.gulfFallback).map((row: any) => row.contentId),
  existingFilesNotRegistered: rows.flatMap((row: any) => [
    ...(row.entranceExists && !row.entranceResolvedPath ? [row.entranceId] : []),
    ...(row.interiorExists && !row.interiorResolvedPath ? [row.interiorId] : []),
  ]),
  duplicateRegistryMappings,
  otherDialectCairoIds,
};

const report = {
  scenarioCount: rows.length,
  resolvedEntranceCount: rows.filter((row: any) => row.entranceResolvedPath).length,
  resolvedInteriorCount: rows.filter((row: any) => row.interiorResolvedPath).length,
  missingPngCount: missing.length,
  missingPngs: [...new Set(missing)].sort(),
  sharedImageIds,
  failures,
  rows,
};

const output = resolve(ROOT, 'tmp/egyptian-scenario-image-audit.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (Object.values(failures).some(value => Array.isArray(value) ? value.length > 0 : value)) {
  process.exitCode = 1;
}
