export type PlacePoint = { lat: number; lng: number; label: string };

const FALLBACK: PlacePoint = { lat: 17.385, lng: 78.4867, label: "Around you" };

export function mapsHref(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function liveLeft(until?: string, now = Date.now()) {
  if (!until) return "";
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return "";
  const m = Math.max(1, Math.round(ms / 60000));
  return m >= 60 ? `${Math.round(m / 60)}h left` : `${m}m left`;
}

export async function readPlace(): Promise<PlacePoint> {
  const geo = globalThis.navigator?.geolocation;
  if (!geo) return FALLBACK;
  return new Promise((resolve) => {
    geo.getCurrentPosition(
      (pos) =>
        resolve({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          label: "Here",
        }),
      () => resolve(FALLBACK),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15_000 },
    );
  });
}
