import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { ALPHABET_AUDIO } from '../data/alphabet-audio';
import { getDialectContent } from '../data/content-registry';
import { getDialectProgressionItems } from './content-resolver';

export type OfflineDialect = 'gulf' | 'egyptian' | 'msa';

export interface OfflinePackRecord {
  downloaded: boolean;
  downloadedAt: string | null;
  assetCount: number;
  version: number;
}

export type OfflinePackMap = Record<OfflineDialect, OfflinePackRecord>;

const OFFLINE_PACKS_STORAGE_KEY = 'offline_dialect_packs_v1';
const OFFLINE_PACK_VERSION = 1;

const EMPTY_PACKS: OfflinePackMap = {
  gulf: { downloaded: false, downloadedAt: null, assetCount: 0, version: OFFLINE_PACK_VERSION },
  egyptian: { downloaded: false, downloadedAt: null, assetCount: 0, version: OFFLINE_PACK_VERSION },
  msa: { downloaded: false, downloadedAt: null, assetCount: 0, version: OFFLINE_PACK_VERSION },
};

function uniqueAudioModules(dialect: OfflineDialect): number[] {
  const content = getDialectContent(dialect);
  const curriculumItems = getDialectProgressionItems(dialect);
  const ids = new Set<number>();

  const maybeAdd = (value: unknown) => {
    if (typeof value === 'number') ids.add(value);
  };

  curriculumItems.forEach(item => {
    if (item.contentType === 'lesson') {
      const words = item.lessonWords ?? (item.lessonKey ? content.lessons[item.lessonKey] : undefined) ?? [];
      words.forEach(word => maybeAdd(word.audio));
    }
    if (item.contentType === 'scenario' && item.scenarioName) {
      const turns = content.scenarios[item.scenarioName] ?? [];
      turns.forEach(turn => maybeAdd(turn.audio));
    }
    if (item.contentType === 'writing') {
      ALPHABET_AUDIO.forEach(letter => maybeAdd(letter.audio));
    }
  });

  return [...ids];
}

export async function getOfflinePackMap(): Promise<OfflinePackMap> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_PACKS_STORAGE_KEY);
    if (!raw) return EMPTY_PACKS;
    const parsed = JSON.parse(raw) as Partial<OfflinePackMap>;
    return {
      gulf: parsed.gulf ?? EMPTY_PACKS.gulf,
      egyptian: parsed.egyptian ?? EMPTY_PACKS.egyptian,
      msa: parsed.msa ?? EMPTY_PACKS.msa,
    };
  } catch (error) {
    console.warn('Offline packs load error:', error);
    return EMPTY_PACKS;
  }
}

async function saveOfflinePackMap(map: OfflinePackMap): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_PACKS_STORAGE_KEY, JSON.stringify(map));
}

export async function downloadOfflineDialectPack(
  dialect: OfflineDialect,
  onProgress?: (progress: number, completed: number, total: number) => void,
): Promise<OfflinePackRecord> {
  const assetIds = uniqueAudioModules(dialect);
  const total = assetIds.length;
  let completed = 0;

  for (const assetId of assetIds) {
    const asset = Asset.fromModule(assetId);
    await asset.downloadAsync();
    completed += 1;
    onProgress?.(total === 0 ? 1 : completed / total, completed, total);
  }

  const nextRecord: OfflinePackRecord = {
    downloaded: true,
    downloadedAt: new Date().toISOString(),
    assetCount: total,
    version: OFFLINE_PACK_VERSION,
  };

  const map = await getOfflinePackMap();
  const updated: OfflinePackMap = {
    ...map,
    [dialect]: nextRecord,
  };
  await saveOfflinePackMap(updated);
  return nextRecord;
}

export async function removeOfflineDialectPack(dialect: OfflineDialect): Promise<void> {
  const map = await getOfflinePackMap();
  const updated: OfflinePackMap = {
    ...map,
    [dialect]: {
      downloaded: false,
      downloadedAt: null,
      assetCount: 0,
      version: OFFLINE_PACK_VERSION,
    },
  };
  await saveOfflinePackMap(updated);
}

export function getOfflineDialectAssetCount(dialect: OfflineDialect): number {
  return uniqueAudioModules(dialect).length;
}
