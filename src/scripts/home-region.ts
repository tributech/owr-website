import {
  apiFetch,
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
    btn.classList.toggle('bg-white', active);
    btn.classList.toggle('text-gray-900', active);
    btn.classList.toggle('bg-white/10', !active);
    btn.classList.toggle('text-white', !active);
  });
  $('panel-events')?.classList.toggle('hidden', tab !== 'events');
  $('panel-players')?.classList.toggle('hidden', tab !== 'players');
}

function renderBar(region: LandingRegion | null) {
  $('region-flag')!.textContent = region?.country_flag ?? '🌐';
  $('region-name')!.textContent = region?.name ?? 'Choose your region';
  $('region-meta')!.textContent = region
    ? `${region.player_count.toLocaleString()} players · ${region.tournament_count.toLocaleString()} tournaments`
    : 'Pick a region to see local events and rankings';
}

function renderCtas(region: LandingRegion | null) {
  const slug = region?.slug;
  $('cta-find')?.setAttribute('href', slug ? `${APP_URL}/${slug}/tournaments/upcoming` : `${APP_URL}/upcoming`);
  $('cta-host')?.setAttribute('href', slug ? `${APP_URL}/${slug}/tournaments/hosted/new` : `${APP_URL}/host`);
  $('cta-find-sub')!.textContent = region ? `In ${region.name}` : 'Near you';
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

  const data = await apiFetch<RegionHome>(`/api/v1/landing/region/${region.code.toLowerCase()}`);
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
  allPlayers.href = data.top_players_scope === 'season' ? `${APP_URL}/${region.slug}/rankings` : `${APP_URL}/global_rankings`;
  allPlayers.textContent = data.top_players_scope === 'season' ? `${region.name} rankings` : 'Global rankings';
}

function renderPicker(regions: LandingRegion[], onPick: (r: LandingRegion) => void) {
  const list = $('region-list')!;
  const filter = $('region-filter') as HTMLInputElement;
  const draw = () => {
    const q = filter.value.trim().toLowerCase();
    list.replaceChildren(
      ...regions
        .filter((r) => r.name.toLowerCase().includes(q))
        .map((r) => {
          const btn = el('button', 'w-full min-h-11 flex items-center gap-3 px-3 rounded-lg text-left hover:bg-white/10 cursor-pointer');
          btn.type = 'button';
          btn.append(
            el('span', 'text-xl leading-none', r.country_flag ?? '🌐'),
            el('span', 'flex-1 font-semibold', r.name),
            el('span', 'text-xs text-gray-400', `${r.player_count.toLocaleString()} players`),
          );
          btn.addEventListener('click', () => onPick(r));
          const li = el('li');
          li.append(btn);
          return li;
        }),
    );
  };
  filter.addEventListener('input', draw);
  draw();
}

async function init() {
  const dialog = $('region-dialog') as HTMLDialogElement;
  document.querySelectorAll('[data-region-open]').forEach((b) => b.addEventListener('click', () => dialog.showModal()));
  $('region-dialog')?.querySelector('[data-region-close]')?.addEventListener('click', () => dialog.close());
  document.querySelectorAll<HTMLElement>('[data-panel-tab]').forEach((b) =>
    b.addEventListener('click', () => setTab(b.dataset.panelTab as 'events' | 'players')),
  );

  const install = $('app-install') as HTMLAnchorElement | null;
  const store = storeUrlForDevice(navigator.userAgent);
  if (install && store) install.href = store;

  const [regionsRes, user] = await Promise.all([
    apiFetch<LandingRegionsResponse>('/api/v1/landing/regions'),
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
  const openFromHash = () => {
    if (location.hash === '#region' && !dialog.open) dialog.showModal();
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

init();
