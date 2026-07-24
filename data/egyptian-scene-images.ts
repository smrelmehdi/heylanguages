export function getEgyptianSceneImageIds(contentId: string) {
  const base = `cairo-${contentId}`;
  return {
    entranceId: `${base}-entrance`,
    interiorId: `${base}-interior`,
    entrancePath: `assets/images/${base}-entrance.png`,
    interiorPath: `assets/images/${base}-interior.png`,
  };
}
