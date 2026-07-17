import type { CurriculumItem, SupportedDialect } from './types';

export const WRITING_FAMILIES = [
  ['alif_family', 'alif', 'Alif Family'],
  ['ba_family', 'ba', 'Ba Family'],
  ['jeem_family', 'jeem', 'Jeem Family'],
  ['dal_family', 'dal', 'Dal Family'],
  ['ra_family', 'ra', 'Ra Family'],
  ['seen_family', 'seen', 'Seen Family'],
  ['sad_family', 'sad', 'Sad Family'],
  ['taa_family', 'taa', 'Taa Family'],
  ['ayn_family', 'ayn', 'Ayn Family'],
  ['fa_family', 'fa', 'Fa Family'],
  ['kaf_family', 'kaf', 'Kaf Family'],
  ['meem_family', 'meem', 'Meem Family'],
  ['ha_family', 'ha', 'Ha Family'],
  ['ya_family', 'ya', 'Ya Family'],
] as const;

export function buildSharedWritingItems(dialect: SupportedDialect): CurriculumItem[] {
  return WRITING_FAMILIES.map(([contentId, family, title]) => ({
    dialect,
    unitId: 'unit-3',
    contentId,
    contentType: 'writing',
    title,
    subtitle: '3 mins',
    route: { screen: 'writing', params: { family } },
    homeHref: `/writing?family=${family}`,
    availability: 'shared',
    commercialAccess: 'free',
    sharedContentKey: `arabic-script:${family}`,
  }));
}
