import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { getAlphabetAudioForDialect } from '../data/alphabet-audio-by-dialect';
import { getDialectContent } from '../data/content-registry';
import { MSA_WRITING_EXAMPLE_WORDS } from '../data/msa-alphabet-audio';
import { getDialectProgressionItems } from './content-resolver';

export type OfflineDialect = 'gulf' | 'egyptian' | 'msa';

export interface OfflinePackRecord {
  downloaded: boolean;
  downloadedAt: string | null;
  assetCount: number;
  downloadedFileCount: number;
  totalBytes: number;
  version: number;
  manifestId: string | null;
}

export type OfflinePackMap = Record<OfflineDialect, OfflinePackRecord>;

export type OfflinePackManifestFile = {
  assetId: number;
  logicalPath: string;
};

export type OfflinePackManifest = {
  dialect: OfflineDialect;
  version: number;
  manifestId: string;
  expectedBytes: number;
  files: OfflinePackManifestFile[];
};

export type OfflinePackManifestInfo = {
  available: boolean;
  version: number;
  manifestId: string;
  fileCount: number;
  expectedBytes: number;
};

export type OfflinePackProgress = {
  progress: number;
  completed: number;
  total: number;
  currentFile: string | null;
};

type StoredPackMap = Partial<Record<OfflineDialect, Partial<OfflinePackRecord>>>;
type FileInfo = { exists: boolean; size?: number };
type RuntimeAsset = {
  hash?: string | null;
  name?: string;
  type?: string;
  localUri?: string | null;
  uri: string;
  downloadAsync: () => Promise<unknown>;
};

export type OfflinePackRuntime = {
  documentDirectory: string | null;
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  };
  assetFromModule: (assetId: number) => RuntimeAsset;
  getInfo: (uri: string) => Promise<FileInfo>;
  readDirectory: (uri: string) => Promise<string[]>;
  makeDirectory: (uri: string) => Promise<void>;
  copy: (from: string, to: string) => Promise<void>;
  move: (from: string, to: string) => Promise<void>;
  remove: (uri: string) => Promise<void>;
  now: () => Date;
  log: (event: string, detail: Record<string, unknown>) => void;
};

const OFFLINE_PACKS_STORAGE_KEY = 'offline_dialect_packs_v2';
const OFFLINE_PACK_VERSION = 2;
const OFFLINE_PACK_EXPECTED_BYTES: Record<OfflineDialect, number> = {
  // Generated from the checked-in source MP3s. Validation still uses actual copied sizes.
  gulf: 22_798_590,
  egyptian: 16_659_640,
  msa: 20_028_154,
};
const DIALECTS: OfflineDialect[] = ['gulf', 'egyptian', 'msa'];

function emptyPack(): OfflinePackRecord {
  return {
    downloaded: false,
    downloadedAt: null,
    assetCount: 0,
    downloadedFileCount: 0,
    totalBytes: 0,
    version: OFFLINE_PACK_VERSION,
    manifestId: null,
  };
}

export function createEmptyOfflinePackMap(): OfflinePackMap {
  return {
    gulf: emptyPack(),
    egyptian: emptyPack(),
    msa: emptyPack(),
  };
}

function buildManifestFiles(dialect: OfflineDialect): OfflinePackManifestFile[] {
  const content = getDialectContent(dialect);
  const files = new Map<number, OfflinePackManifestFile>();

  const maybeAdd = (audio: unknown, audioPath?: unknown) => {
    if (typeof audio !== 'number' || files.has(audio)) return;
    const asset = Asset.fromModule(audio);
    const fallbackName = `${asset.hash || asset.name || `module-${audio}`}.${asset.type || 'mp3'}`;
    files.set(audio, {
      assetId: audio,
      logicalPath: typeof audioPath === 'string' && audioPath.trim() ? audioPath : fallbackName,
    });
  };

  getDialectProgressionItems(dialect).forEach(item => {
    if (item.contentType === 'lesson') {
      const words = item.lessonWords ?? (item.lessonKey ? content.lessons[item.lessonKey] : undefined) ?? [];
      words.forEach(word => maybeAdd(word.audio, word.audioPath));
    }
    if (item.contentType === 'scenario' && item.scenarioName) {
      const turns = content.scenarios[item.scenarioName] ?? [];
      turns.forEach(turn => maybeAdd(turn.audio, turn.audioPath));
    }
    if (item.contentType === 'writing') {
      getAlphabetAudioForDialect(dialect).forEach(letter => maybeAdd(letter.audio, letter.audioPath));
      if (dialect === 'msa') {
        MSA_WRITING_EXAMPLE_WORDS.forEach(word => maybeAdd(word.audio, word.audioPath));
      }
    }
  });

  return [...files.values()].sort((left, right) => left.logicalPath.localeCompare(right.logicalPath));
}

const manifestCache = new Map<OfflineDialect, OfflinePackManifest>();

export function getOfflineDialectManifest(dialect: OfflineDialect): OfflinePackManifest {
  const cached = manifestCache.get(dialect);
  if (cached) return cached;
  const files = buildManifestFiles(dialect);
  const signature = files.map(file => {
    const asset = Asset.fromModule(file.assetId);
    return `${file.logicalPath}:${asset.hash || asset.name || file.assetId}`;
  }).join('|');
  const manifest: OfflinePackManifest = {
    dialect,
    version: OFFLINE_PACK_VERSION,
    manifestId: `${dialect}-v${OFFLINE_PACK_VERSION}-${hashText(signature)}`,
    expectedBytes: OFFLINE_PACK_EXPECTED_BYTES[dialect],
    files,
  };
  manifestCache.set(dialect, manifest);
  return manifest;
}

export function getOfflineDialectManifestInfo(dialect: OfflineDialect): OfflinePackManifestInfo {
  const manifest = getOfflineDialectManifest(dialect);
  return {
    available: manifest.files.length > 0,
    version: manifest.version,
    manifestId: manifest.manifestId,
    fileCount: manifest.files.length,
    expectedBytes: manifest.expectedBytes,
  };
}

export function getOfflineDialectPlannedAudioPaths(dialect: OfflineDialect): string[] {
  return getOfflineDialectManifest(dialect).files.map(file => file.logicalPath);
}

export function getOfflineDialectAssetCount(dialect: OfflineDialect): number {
  return getOfflineDialectManifest(dialect).files.length;
}

export function isOfflinePackRecordCurrent(
  record: OfflinePackRecord,
  manifest: OfflinePackManifest,
): boolean {
  return record.downloaded &&
    record.version === manifest.version &&
    record.manifestId === manifest.manifestId &&
    record.assetCount === manifest.files.length;
}

export function isOfflinePackUpdateAvailable(record: OfflinePackRecord, dialect: OfflineDialect): boolean {
  const manifest = getOfflineDialectManifest(dialect);
  return record.downloaded && !isOfflinePackRecordCurrent(record, manifest);
}

export function isOfflinePackReady(record: OfflinePackRecord, dialect: OfflineDialect): boolean {
  return record.downloaded && !isOfflinePackUpdateAvailable(record, dialect);
}

function safePackRecord(value: Partial<OfflinePackRecord> | undefined): OfflinePackRecord {
  const fallback = emptyPack();
  if (!value) return fallback;
  return {
    downloaded: value.downloaded === true,
    downloadedAt: typeof value.downloadedAt === 'string' ? value.downloadedAt : null,
    assetCount: Number.isFinite(value.assetCount) ? Math.max(0, Number(value.assetCount)) : 0,
    downloadedFileCount: Number.isFinite(value.downloadedFileCount)
      ? Math.max(0, Number(value.downloadedFileCount))
      : 0,
    totalBytes: Number.isFinite(value.totalBytes) ? Math.max(0, Number(value.totalBytes)) : 0,
    version: Number.isFinite(value.version) ? Number(value.version) : fallback.version,
    manifestId: typeof value.manifestId === 'string' ? value.manifestId : null,
  };
}

function parseStoredMap(raw: string | null): OfflinePackMap {
  if (!raw) return createEmptyOfflinePackMap();
  try {
    const parsed = JSON.parse(raw) as StoredPackMap;
    return {
      gulf: safePackRecord(parsed.gulf),
      egyptian: safePackRecord(parsed.egyptian),
      msa: safePackRecord(parsed.msa),
    };
  } catch {
    return createEmptyOfflinePackMap();
  }
}

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function createOfflinePackManager(
  runtime: OfflinePackRuntime,
  getManifest: (dialect: OfflineDialect) => OfflinePackManifest = getOfflineDialectManifest,
) {
  let packCache: OfflinePackMap | null = null;
  let storageQueue: Promise<void> = Promise.resolve();
  const activeDownloads = new Map<OfflineDialect, Promise<OfflinePackRecord>>();

  const packRoot = () => {
    if (!runtime.documentDirectory) throw new Error('Offline storage is unavailable on this device.');
    return `${runtime.documentDirectory}offline-audio/`;
  };

  const packDirectory = (dialect: OfflineDialect) => `${packRoot()}${dialect}/`;

  const destinationFor = (dialect: OfflineDialect, file: OfflinePackManifestFile) => {
    const asset = runtime.assetFromModule(file.assetId);
    const extension = asset.type || 'mp3';
    const stableName = `${asset.hash || 'asset'}-${hashText(file.logicalPath)}`;
    return `${packDirectory(dialect)}${stableName}.${extension}`;
  };

  const isValidFile = async (uri: string) => {
    const info = await runtime.getInfo(uri);
    return info.exists && typeof info.size === 'number' && info.size > 0 ? info.size : 0;
  };

  const verifyManifest = async (dialect: OfflineDialect, manifest: OfflinePackManifest) => {
    let validCount = 0;
    let totalBytes = 0;
    const failedFiles: string[] = [];
    const workers = [...manifest.files];
    const verifyWorker = async () => {
      while (workers.length > 0) {
        const file = workers.shift();
        if (!file) return;
        const size = await isValidFile(destinationFor(dialect, file));
        if (size > 0) {
          validCount += 1;
          totalBytes += size;
        } else {
          failedFiles.push(file.logicalPath);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(8, manifest.files.length) }, verifyWorker));
    return { validCount, totalBytes, failedFiles };
  };

  const readStoredMap = async () => parseStoredMap(await runtime.storage.getItem(OFFLINE_PACKS_STORAGE_KEY));

  const persistRecord = async (dialect: OfflineDialect, record: OfflinePackRecord) => {
    let savedMap = createEmptyOfflinePackMap();
    const write = async () => {
      const current = await readStoredMap();
      savedMap = { ...current, [dialect]: record };
      await runtime.storage.setItem(OFFLINE_PACKS_STORAGE_KEY, JSON.stringify(savedMap));
      packCache = savedMap;
    };
    const queued = storageQueue.then(write, write);
    storageQueue = queued.then(() => {}, () => {});
    await queued;
    runtime.log('persisted', {
      dialect,
      downloaded: record.downloaded,
      fileCount: record.downloadedFileCount,
      manifestVersion: record.version,
    });
    return savedMap;
  };

  const load = async (): Promise<OfflinePackMap> => {
    await storageQueue;
    if (packCache) return packCache;
    const stored = await readStoredMap();
    let changed = false;

    for (const dialect of DIALECTS) {
      const record = stored[dialect];
      if (!record.downloaded) continue;
      const manifest = getManifest(dialect);
      if (!isOfflinePackRecordCurrent(record, manifest)) {
        continue;
      }
      const verification = await verifyManifest(dialect, manifest);
      if (verification.validCount !== manifest.files.length) {
        stored[dialect] = {
          ...record,
          downloaded: false,
          downloadedAt: null,
          downloadedFileCount: verification.validCount,
          totalBytes: verification.totalBytes,
        };
        changed = true;
      }
    }

    if (changed) {
      await runtime.storage.setItem(OFFLINE_PACKS_STORAGE_KEY, JSON.stringify(stored));
    }
    packCache = stored;
    runtime.log('hydrated', {
      persistedPackState: DIALECTS.map(dialect => ({ dialect, ...stored[dialect] })),
    });
    return stored;
  };

  const performDownload = async (
    dialect: OfflineDialect,
    isPremium: boolean,
    onProgress?: (progress: OfflinePackProgress) => void,
  ): Promise<OfflinePackRecord> => {
    if (!isPremium) throw new Error('Offline packs are members-only.');
    const manifest = getManifest(dialect);
    if (manifest.files.length === 0) throw new Error('Offline pack not available yet.');
    const directory = packDirectory(dialect);
    await runtime.makeDirectory(directory);
    runtime.log('download-start', {
      dialect,
      manifestVersion: manifest.version,
      manifestFileCount: manifest.files.length,
      totalExpectedBytes: manifest.expectedBytes,
      destinationDirectory: directory,
    });
    onProgress?.({ progress: 0, completed: 0, total: manifest.files.length, currentFile: null });

    let completed = 0;
    const failedFiles: string[] = [];
    const work = [...manifest.files];

    const worker = async () => {
      while (work.length > 0) {
        const file = work.shift();
        if (!file) return;
        const destination = destinationFor(dialect, file);
        try {
          let size = await isValidFile(destination);
          if (size === 0) {
            const asset = runtime.assetFromModule(file.assetId);
            await asset.downloadAsync();
            const source = asset.localUri || asset.uri;
            const sourceInfo = await runtime.getInfo(source);
            if (!sourceInfo.exists || !sourceInfo.size) {
              throw new Error('Bundled source audio is missing or empty.');
            }
            const temporary = `${destination}.partial`;
            await runtime.remove(temporary);
            await runtime.copy(source, temporary);
            if ((await isValidFile(temporary)) === 0) {
              throw new Error('Copied audio failed verification.');
            }
            await runtime.remove(destination);
            await runtime.move(temporary, destination);
            size = await isValidFile(destination);
            if (size === 0) throw new Error('Final audio failed verification.');
          }
          completed += 1;
          runtime.log('file-progress', {
            dialect,
            completed,
            total: manifest.files.length,
            filename: file.logicalPath,
          });
        } catch {
          failedFiles.push(file.logicalPath);
        }
        onProgress?.({
          progress: completed / manifest.files.length,
          completed,
          total: manifest.files.length,
          currentFile: file.logicalPath,
        });
      }
    };

    await Promise.all(Array.from({ length: Math.min(4, manifest.files.length) }, worker));
    const verification = await verifyManifest(dialect, manifest);
    const complete = failedFiles.length === 0 && verification.validCount === manifest.files.length;
    if (complete) {
      const expectedFilenames = new Set(manifest.files.map(file => destinationFor(dialect, file).split('/').pop()));
      const existingFilenames = await runtime.readDirectory(directory);
      await Promise.all(existingFilenames
        .filter(filename => !expectedFilenames.has(filename))
        .map(filename => runtime.remove(`${directory}${filename}`)));
    }
    const record: OfflinePackRecord = {
      downloaded: complete,
      downloadedAt: complete ? runtime.now().toISOString() : null,
      assetCount: manifest.files.length,
      downloadedFileCount: verification.validCount,
      totalBytes: verification.totalBytes,
      version: manifest.version,
      manifestId: manifest.manifestId,
    };
    await persistRecord(dialect, record);
    runtime.log('verification', {
      dialect,
      verified: complete,
      validFiles: verification.validCount,
      totalFiles: manifest.files.length,
      totalBytes: verification.totalBytes,
      failedFilenames: [...new Set([...failedFiles, ...verification.failedFiles])],
    });
    if (!complete) {
      throw new Error(`Offline pack incomplete. ${verification.validCount} of ${manifest.files.length} files verified.`);
    }
    return record;
  };

  const download = (
    dialect: OfflineDialect,
    isPremium: boolean,
    onProgress?: (progress: OfflinePackProgress) => void,
  ): Promise<OfflinePackRecord> => {
    const active = activeDownloads.get(dialect);
    if (active) return active;
    const operation = performDownload(dialect, isPremium, onProgress)
      .finally(() => activeDownloads.delete(dialect));
    activeDownloads.set(dialect, operation);
    return operation;
  };

  const remove = async (dialect: OfflineDialect) => {
    await runtime.remove(packDirectory(dialect));
    await persistRecord(dialect, emptyPack());
    runtime.log('removed', { dialect });
  };

  const resolve = async (source: unknown): Promise<unknown> => {
    if (typeof source !== 'number') return source;
    const packs = await load();
    for (const dialect of DIALECTS) {
      const record = packs[dialect];
      if (!record.downloaded) continue;
      const manifest = getManifest(dialect);
      if (!isOfflinePackRecordCurrent(record, manifest)) continue;
      const file = manifest.files.find(item => item.assetId === source);
      if (!file) continue;
      const destination = destinationFor(dialect, file);
      if ((await isValidFile(destination)) > 0) {
        runtime.log('playback-resolution', {
          dialect,
          filename: file.logicalPath,
          resolution: 'downloaded-local-file',
        });
        return { uri: destination };
      }
    }
    return source;
  };

  return {
    load,
    download,
    remove,
    resolve,
    isUpdateAvailable: (dialect: OfflineDialect, record: OfflinePackRecord) =>
      record.downloaded && !isOfflinePackRecordCurrent(record, getManifest(dialect)),
    isDownloadActive: (dialect: OfflineDialect) => activeDownloads.has(dialect),
    clearMemoryCache: () => { packCache = null; },
  };
}

function developmentLog(event: string, detail: Record<string, unknown>) {
  if (__DEV__) console.info(`[offline-pack] ${event}`, detail);
}

const defaultRuntime: OfflinePackRuntime = {
  documentDirectory: FileSystem.documentDirectory,
  storage: AsyncStorage,
  assetFromModule: assetId => Asset.fromModule(assetId),
  getInfo: uri => FileSystem.getInfoAsync(uri),
  readDirectory: uri => FileSystem.readDirectoryAsync(uri),
  makeDirectory: uri => FileSystem.makeDirectoryAsync(uri, { intermediates: true }),
  copy: (from, to) => FileSystem.copyAsync({ from, to }),
  move: (from, to) => FileSystem.moveAsync({ from, to }),
  remove: uri => FileSystem.deleteAsync(uri, { idempotent: true }),
  now: () => new Date(),
  log: developmentLog,
};

const defaultManager = createOfflinePackManager(defaultRuntime);

export async function getOfflinePackMap(): Promise<OfflinePackMap> {
  return defaultManager.load();
}

export async function downloadOfflineDialectPack(
  dialect: OfflineDialect,
  isPremium: boolean,
  onProgress?: (progress: number, completed: number, total: number) => void,
): Promise<OfflinePackRecord> {
  return defaultManager.download(dialect, isPremium, state => {
    onProgress?.(state.progress, state.completed, state.total);
  });
}

export async function removeOfflineDialectPack(dialect: OfflineDialect): Promise<void> {
  await defaultManager.remove(dialect);
}

export async function resolveOfflineAudioSource(source: unknown): Promise<unknown> {
  return defaultManager.resolve(source);
}
