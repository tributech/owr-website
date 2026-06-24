/** Static data for Renegade Effect article - Mar 2025 to Mar 2026 (excl April 2026) */

export const MONTHS = ['Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26','Mar 26'] as const;

// ── Slide 2: Adoption timeline ──
export const allOffVol = [68,55,49,45,52,60,60,49,53,33,36,43,54];
export const allRenVol = [0,5,27,15,30,33,28,54,41,40,64,47,56];

// ── Slide 3: Regional data (regions with 3+ events both sides) ──
export interface RegionRow { name: string; offPct: number; renPct: number; offCount: number; renCount: number }
export const regionData: RegionRow[] = [
  { name: 'Poland',      offPct: 12.9, renPct: 25.7, offCount: 35, renCount: 54 },
  { name: 'Netherlands',  offPct: 13.9, renPct: 26.8, offCount: 7,  renCount: 13 },
  { name: 'United States',offPct: 18.0, renPct: 29.3, offCount: 145,renCount: 95 },
  { name: 'Germany',      offPct: 19.1, renPct: 29.6, offCount: 13, renCount: 11 },
  { name: 'Switzerland',  offPct: 19.4, renPct: 29.3, offCount: 7,  renCount: 4 },
  { name: 'Belgium',      offPct: 13.6, renPct: 22.9, offCount: 5,  renCount: 10 },
  { name: 'Sweden',       offPct: 23.2, renPct: 31.4, offCount: 15, renCount: 19 },
  { name: 'Canada',       offPct: 18.1, renPct: 25.8, offCount: 34, renCount: 24 },
  { name: 'United Kingdom',offPct: 19.0, renPct: 25.7, offCount: 147,renCount: 71 },
  { name: 'Finland',      offPct: 22.4, renPct: 29.1, offCount: 6,  renCount: 8 },
  { name: 'Spain',        offPct: 19.7, renPct: 25.5, offCount: 113,renCount: 46 },
  { name: 'Denmark',      offPct: 24.0, renPct: 29.5, offCount: 5,  renCount: 10 },
  { name: 'Norway',       offPct: 24.6, renPct: 29.5, offCount: 5,  renCount: 7 },
  { name: 'Australia',    offPct: 20.1, renPct: 23.6, offCount: 57, renCount: 36 },
  { name: 'New Zealand',  offPct: 20.2, renPct: 23.5, offCount: 9,  renCount: 9 },
  { name: 'Ireland',      offPct: 25.0, renPct: 26.2, offCount: 3,  renCount: 3 },
  { name: 'Online',       offPct: 18.7, renPct: 21.8, offCount: 8,  renCount: 9 },
];

// ── Slide 4: GT diversity & player share (WITH VC) ──
export const gtOffAvg = [3.45,3.31,2.64,2.71,2.83,2.89,3.13,3.75,4.00,4.00,2.86,3.20,2.67];
export const gtRenAvg = [null,2.50,2.88,5.33,3.25,2.80,3.00,3.50,3.60,2.50,3.30,3.17,2.88];
export const gtOffPct = [24.1,19.3,20.2,17.1,19.2,21.4,18.0,21.0,21.4,19.3,21.9,18.8,16.1];
export const gtRenPct = [null,26.8,25.5,24.9,19.7,19.8,23.1,22.0,25.3,21.8,23.8,23.6,19.7];

// ── Slide 5: VC dominance (official GT legacy players) ──
export const vcDoughnutLabels = ['Vampire Counts (237)','Chaos Dwarfs (67)','Ogre Kingdoms (58)','Dark Elves (55)','Daemons (51)','Skaven (42)','Lizardmen (38)'];
export const vcDoughnutData = [237,67,58,55,51,42,38];

// ── Slide 5: VC vs non-VC monthly (GT players) ──
export const vcOffPlayers  = [11,32,16,7,20,18,32,24,18,8,13,15,22];
export const nvOffPlayers  = [39,47,34,16,14,23,26,34,23,7,14,17,16];
export const vcRenPlayers  = [null,2,11,13,4,4,6,13,8,1,10,16,6];
export const nvRenPlayers  = [null,6,23,23,12,12,16,24,45,13,35,37,31];

// ── Slide 6: With vs Without VC comparison ──
export const vcCompareLabels = ['Player Share (with VC)','Player Share (no VC)','Avg Distinct (with VC)','Avg Distinct (no VC)'];
export const vcCompareOfficial  = [20.0, 12.2, 3.12, 2.15];
export const vcCompareRenegade  = [23.4, 18.2, 3.24, 2.59];

// ── Slide 7: Per-faction data ──
export interface FactionRow { name: string; offPres: number; renPres: number; offWin: number; renWin: number }
export const factionData: FactionRow[] = [
  { name: 'Skaven',           offPres: 30.6, renPres: 55.0, offWin: 27.9, renWin: 39.5 },
  { name: 'Ogre Kingdoms',    offPres: 37.0, renPres: 48.8, offWin: 43.6, renWin: 44.5 },
  { name: 'Lizardmen',        offPres: 28.7, renPres: 40.0, offWin: 31.1, renWin: 39.9 },
  { name: 'Chaos Dwarfs',     offPres: 40.7, renPres: 45.0, offWin: 36.5, renWin: 48.1 },
  { name: 'Daemons of Chaos', offPres: 39.8, renPres: 35.0, offWin: 40.4, renWin: 39.0 },
  { name: 'Dark Elves',       offPres: 38.0, renPres: 35.0, offWin: 35.6, renWin: 34.8 },
  { name: 'Vampire Counts',   offPres: 71.3, renPres: 65.0, offWin: 48.3, renWin: 49.2 },
];

// ── Slide 8: Skaven monthly presence ──
export const skOffPres = [45.5,21.4,18.2,0,14.3,30,40,50,66.7,50,28.6,16.7,33.3];
export const skRenPres = [null,100,50,66.7,25,40,33.3,33.3,50,50,60,83.3,50];

// ── Colors ──
export const C = {
  off: '#6b8acd',
  offBg: 'rgba(107,138,205,0.55)',
  offFill: 'rgba(107,138,205,0.06)',
  ren: '#c95c4c',
  renBg: 'rgba(201,92,76,0.55)',
  renFill: 'rgba(201,92,76,0.06)',
  gold: '#FFD700',
  goldDark: '#DAA520',
  vc: '#8b5cf6',
  green: '#4caf50',
  gridLine: 'rgba(255,255,255,0.06)',
  tooltipBg: '#1a1e28',
} as const;
