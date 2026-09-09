// Pull an 11-character YouTube video id out of any of the usual URL shapes,
// or accept a bare id. Returns null when nothing usable is found.
export function youtubeId(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return valid(u.pathname.slice(1));
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') return valid(u.searchParams.get('v'));
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // not a URL
  }
  return null;
}

function valid(id: string | null): string | null {
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}
