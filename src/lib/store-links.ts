export const APP_STORE_URL = 'https://apps.apple.com/app/id6757371153';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.oldworldrankings.android';

export function storeUrlForDevice(userAgent: string): string | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return APP_STORE_URL;
  if (/Android/i.test(userAgent)) return PLAY_STORE_URL;
  return null;
}
