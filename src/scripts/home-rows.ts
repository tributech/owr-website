import { appUrl, type RegionEvent, type RegionTopPlayer } from '../lib/api';

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Event dates are calendar days in the event's zone; parse as parts, never via Date(string).
function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

function dateLabel(event: RegionEvent): string {
  const start = parts(event.start_date);
  const startText = `${DAYS[start.weekday]} ${start.d} ${LONG_MONTHS[start.m - 1]}`;
  if (!event.end_date || event.end_date === event.start_date) return startText;
  const end = parts(event.end_date);
  const endText = `${end.d} ${LONG_MONTHS[end.m - 1]}`;
  return event.live ? `Until ${endText}` : `${start.d} ${LONG_MONTHS[start.m - 1]} to ${endText}`;
}

export function eventRow(event: RegionEvent): HTMLLIElement {
  const start = parts(event.start_date);
  const li = el('li');
  const a = el('a', 'flex items-center gap-3.5 py-2.5 group');
  a.href = appUrl(event.url);

  const date = el('div', 'w-[50px] shrink-0 text-center rounded-lg bg-black/40 py-1.5');
  date.append(
    el('div', 'text-[10px] font-bold text-owr-gold', MONTHS[start.m - 1]),
    el('div', 'text-xl font-bold leading-tight text-white', String(start.d)),
  );

  const body = el('div', 'min-w-0 flex-1');
  body.append(el('div', 'font-semibold text-sm text-white truncate group-hover:text-owr-gold transition-colors', event.name));
  const meta = el('div', 'flex items-center gap-2 text-xs text-white/60 mt-0.5');
  if (event.live) meta.append(el('span', 'text-[10px] font-bold px-1.5 py-px rounded-full bg-red-600 text-white', 'LIVE'));
  meta.append(el('span', 'truncate', [dateLabel(event), event.city].filter(Boolean).join(' · ')));
  body.append(meta);

  a.append(date, body);
  li.append(a);
  return li;
}

const MEDALS: Record<number, string> = {
  1: 'bg-owr-gold text-gray-900',
  2: 'bg-owr-silver text-gray-900',
  3: 'bg-owr-bronze text-white',
};

export function playerRow(player: RegionTopPlayer): HTMLLIElement {
  const li = el('li');
  const a = el('a', 'flex items-center gap-3.5 py-3 group');
  a.href = appUrl(player.url);
  const medal = el('div', `w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold ${MEDALS[player.rank] ?? 'bg-white/10 text-white'}`, String(player.rank));
  const body = el('div', 'min-w-0 flex-1');
  body.append(el('div', 'font-semibold text-sm text-white truncate group-hover:text-owr-gold transition-colors', player.name));
  if (player.global_rank) body.append(el('div', 'text-[11px] text-white/55', `#${player.global_rank} globally`));
  a.append(medal, body, el('div', 'font-bold text-sm text-white', player.points));
  li.append(a);
  return li;
}
