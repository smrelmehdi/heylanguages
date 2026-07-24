export const EGYPTIAN_SCENE_IMAGE_REUSE: Readonly<Record<string, string>> = {
  'cafe-order': 'cairo-cafe',
  'restaurant-order': 'cairo-restaurant',
  'everyday-supermarket': 'cairo-supermarket',
  'everyday-taxi': 'cairo-taxi',
  'everyday-pharmacy': 'cairo-pharmacy',
  'everyday-hotel': 'cairo-hotel',
  'everyday-airport': 'cairo-airport',
  'pharmacy-emergency': 'cairo-pharmacy',
  brunch: 'cairo-cafe',
  'remembering-the-trip': 'cairo-cafe',
};

export function getEgyptianSceneImageIds(contentId: string) {
  const base = EGYPTIAN_SCENE_IMAGE_REUSE[contentId] ?? `cairo-${contentId}`;
  return {
    entranceId: `${base}-entrance`,
    interiorId: `${base}-interior`,
    entrancePath: `assets/images/${base}-entrance.png`,
    interiorPath: `assets/images/${base}-interior.png`,
  };
}
