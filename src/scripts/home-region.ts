import {
  publicApiFetch,
  APP_URL,
  type LandingMe,
  type LandingRegion,
  type LandingRegionsResponse,
  type RegionHome,
} from '../lib/api';
import { resolveRegion, saveRegionCode } from '../lib/region';
import { storeUrlForDevice } from '../lib/store-links';
import { el, eventRow, playerRow } from './home-rows';

const $ = (id: string) => document.getElementById(id);

// Lucide "house", inline because rows are built client-side.
const HOUSE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';

function waitForUser(): Promise<LandingMe | null> {
  if (window.__owrUser !== undefined) return Promise.resolve(window.__owrUser);
  return new Promise((resolve) => {
    document.addEventListener('owr:user-loaded', (e) => resolve((e as CustomEvent).detail), { once: true });
  });
}

function setTab(tab: 'events' | 'players') {
  document.querySelectorAll<HTMLElement>('[data-panel-tab]').forEach((btn) => {
    const active = btn.dataset.panelTab === tab;
    btn.setAttribute('aria-selected', String(active));
  });
  $('panel-events')?.classList.toggle('hidden', tab !== 'events');
  $('panel-players')?.classList.toggle('hidden', tab !== 'players');
}

const regionDashboard = (region: LandingRegion) => `${APP_URL}/${region.slug}/dashboard`;

function renderBar(region: LandingRegion | null) {
  $('region-flag')!.textContent = region?.country_flag ?? '🌐';
  $('region-name')!.textContent = region?.name ?? 'Choose your region';
  $('region-meta')!.textContent = region
    ? `${region.player_count.toLocaleString()} players · ${region.tournament_count.toLocaleString()} tournaments`
    : 'Pick a region to see local events and rankings';
  const go = $('region-go') as HTMLAnchorElement;
  go.href = region ? regionDashboard(region) : `${APP_URL}/dashboard`;
  $('region-go-name')!.textContent = region ? `Go to ${region.name}` : 'Go to region';
  const results = $('region-results') as HTMLAnchorElement;
  // Results matter over the weekend: show Saturday to Tuesday, hide mid-week.
  if ([6, 0, 1, 2].includes(new Date().getDay())) results.classList.replace('hidden', 'flex');
  results.href = region ? `${APP_URL}/${region.slug}/tournaments/latest` : `${APP_URL}/latest`;
}

function renderCtas(region: LandingRegion | null) {
  const slug = region?.slug;
  $('cta-find')?.setAttribute('href', slug ? `${APP_URL}/${slug}/tournaments/upcoming` : `${APP_URL}/upcoming`);
  $('cta-host')?.setAttribute('href', slug ? `${APP_URL}/${slug}/tournaments/hosted/new` : `${APP_URL}/host`);
  $('cta-find-sub')!.textContent = region ? `In ${region.name}` : 'Near you';
  $('explore-results')?.setAttribute('href', slug ? `${APP_URL}/${slug}/tournaments/latest` : `${APP_URL}/latest`);
  if (slug && region?.has_masters) $('explore-rankings')?.setAttribute('href', `${APP_URL}/${slug}/rankings`);
}

function showEmpty(message: string) {
  $('panel-events')?.classList.add('hidden');
  $('panel-players')?.classList.add('hidden');
  const empty = $('panel-empty')!;
  empty.textContent = message;
  empty.classList.remove('hidden');
}

async function renderPanel(region: LandingRegion | null) {
  $('panel-empty')?.classList.add('hidden');
  if (!region) return showEmpty('Choose your region to see upcoming events and top players near you.');

  const data = await publicApiFetch<RegionHome>(`/api/v1/landing/region/${region.code.toLowerCase()}`);
  if (!data) return showEmpty('Local events are unavailable right now.');

  setTab('events');
  const events = $('panel-events-list')!;
  events.replaceChildren(
    ...(data.upcoming_events.length
      ? data.upcoming_events.map(eventRow)
      : [el('li', 'py-6 text-sm text-white/60 text-center', `No upcoming events in ${region.name} yet.`)]),
  );
  const allEvents = $('panel-events-all') as HTMLAnchorElement;
  allEvents.href = `${APP_URL}/${region.slug}/tournaments/upcoming`;
  allEvents.textContent = `All ${region.name} events`;

  $('panel-players-label')!.textContent = `Top in ${region.name}`;
  $('panel-players-list')!.replaceChildren(...data.top_players.map(playerRow));
  const allPlayers = $('panel-players-all') as HTMLAnchorElement;
  const season = data.top_players_season;
  allPlayers.href = season ? `${APP_URL}/${region.slug}/rankings` : `${APP_URL}/global_rankings`;
  allPlayers.textContent = season ? `${region.name} Masters rankings` : 'Global rankings';
  $('panel-players-caption')!.textContent = season
    ? `Masters rankings · ${season.name}${season.current ? '' : ' final standings'}`
    : `Players from ${region.name} in the global rankings`;
}

// Each row opens the region; the house button only switches this page's panel.
function renderPicker(regions: LandingRegion[], onShowHere: (r: LandingRegion) => void) {
  const list = $('region-list')!;
  const filter = $('region-filter') as HTMLInputElement;
  const draw = () => {
    const q = filter.value.trim().toLowerCase();
    list.replaceChildren(
      ...regions
        .filter((r) => r.name.toLowerCase().includes(q))
        .map((r) => {
          const link = el('a', 'flex-1 min-w-0 min-h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-white/10');
          link.href = regionDashboard(r);
          link.append(
            el('span', 'text-xl leading-none', r.country_flag ?? '🌐'),
            el('span', 'flex-1 min-w-0 truncate font-semibold', r.name),
            el('span', 'text-xs text-gray-400', `${r.player_count.toLocaleString()} players`),
          );
          link.addEventListener('click', () => saveRegionCode(r.code));
          const here = el('button', 'shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-owr-gold hover:bg-white/10 cursor-pointer');
          here.type = 'button';
          here.title = `Show ${r.name} on this page`;
          here.setAttribute('aria-label', here.title);
          here.innerHTML = HOUSE_ICON;
          here.addEventListener('click', () => onShowHere(r));
          const li = el('li', 'flex items-center gap-1');
          li.append(link, here);
          return li;
        }),
    );
  };
  filter.addEventListener('input', draw);
  draw();
}

async function init() {
  const dialog = $('region-dialog') as HTMLDialogElement;
  const openPicker = () => {
    if (!dialog.open) dialog.showModal();
  };
  document.querySelectorAll('[data-region-open]').forEach((b) => b.addEventListener('click', openPicker));
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest?.('a[href="/#region"]');
    if (!link) return;
    e.preventDefault();
    openPicker();
  });
  $('region-dialog')?.querySelector('[data-region-close]')?.addEventListener('click', () => dialog.close());
  document.querySelectorAll<HTMLElement>('[data-panel-tab]').forEach((b) =>
    b.addEventListener('click', () => setTab(b.dataset.panelTab as 'events' | 'players')),
  );

  const install = $('app-install') as HTMLAnchorElement | null;
  const store = storeUrlForDevice(navigator.userAgent);
  if (install && store) install.href = store;

  const [regionsRes, user] = await Promise.all([
    publicApiFetch<LandingRegionsResponse>('/api/v1/landing/regions'),
    waitForUser(),
  ]);
  const regions = regionsRes?.regions ?? [];

  const apply = (region: LandingRegion | null) => {
    renderBar(region);
    renderCtas(region);
    renderPanel(region);
  };

  renderPicker(regions, (r) => {
    saveRegionCode(r.code);
    dialog.close();
    apply(r);
  });

  apply(resolveRegion(regions, user?.region_slug ?? null));
  if (location.hash === '#region') {
    history.replaceState(history.state, '', location.pathname + location.search);
    openPicker();
  }
}

init();
