export function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?fm=jpg&fit=crop&w=${width}&q=80`;
}

/* A 4:5 close-up of the same photo, zoomed on a focal point (0–1 coords). */
export function unsplashDetail(id: string, x: number, y: number, zoom: number) {
  return `https://images.unsplash.com/photo-${id}?fm=jpg&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&w=1200&h=1500&q=80`;
}
