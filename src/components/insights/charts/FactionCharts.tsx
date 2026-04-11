import { Bar, Line } from 'react-chartjs-2';
import { factionData, MONTHS, skOffPres, skRenPres, C } from './data';
import type { ChartOptions } from 'chart.js';

const tt = { backgroundColor: C.tooltipBg, borderColor: '#2a2e38', borderWidth: 1, padding: 10, cornerRadius: 8 } as const;
const sorted = [...factionData].sort((a, b) => (b.renPres - b.offPres) - (a.renPres - a.offPres));

export function FactionPresenceChart() {
  return (
    <Bar
      data={{
        labels: sorted.map(f => f.name),
        datasets: [
          { label: 'Official', data: sorted.map(f => f.offPres), backgroundColor: 'rgba(107,138,205,0.6)', borderColor: C.off, borderWidth: 1, borderRadius: 4 },
          { label: 'Renegade', data: sorted.map(f => f.renPres), backgroundColor: 'rgba(201,92,76,0.6)', borderColor: C.ren, borderWidth: 1, borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true, indexAxis: 'y' as const,
        scales: { x: { beginAtZero: true, max: 80, grid: { color: C.gridLine }, ticks: { callback: (v) => v + '%' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } },
        plugins: {
          title: { display: true, text: 'Presence at GTs (% with at least 1 player)', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
          tooltip: tt,
        },
      }}
    />
  );
}

export function WinRateChart() {
  return (
    <Bar
      data={{
        labels: sorted.map(f => f.name),
        datasets: [
          { label: 'Official Win%', data: sorted.map(f => f.offWin), backgroundColor: 'rgba(107,138,205,0.6)', borderColor: C.off, borderWidth: 1, borderRadius: 4 },
          { label: 'Renegade Win%', data: sorted.map(f => f.renWin), backgroundColor: 'rgba(201,92,76,0.6)', borderColor: C.ren, borderWidth: 1, borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true, indexAxis: 'y' as const,
        scales: { x: { beginAtZero: true, max: 55, grid: { color: C.gridLine }, ticks: { callback: (v) => v + '%' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } },
        plugins: {
          title: { display: true, text: 'Win Rate: Official vs Renegade Lists', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
          tooltip: tt,
        },
      }}
    />
  );
}

export function SkavenTimelineChart() {
  return (
    <Line
      data={{
        labels: [...MONTHS],
        datasets: [
          { label: 'Official GTs', data: skOffPres, borderColor: C.off, backgroundColor: C.offFill, borderWidth: 2, pointRadius: 3, pointBackgroundColor: C.off, tension: 0.3, fill: true },
          { label: 'Renegade GTs', data: skRenPres, borderColor: C.ren, backgroundColor: C.renFill, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: C.ren, tension: 0.3, fill: true, spanGaps: false },
        ],
      }}
      options={{
        responsive: true,
        interaction: { mode: 'index' as const, intersect: false },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: C.gridLine }, ticks: { callback: (v) => v + '%' }, title: { display: true, text: '% of GTs with Skaven', color: '#5a5c63', font: { size: 10 } } },
          x: { grid: { display: false } },
        },
        plugins: {
          title: { display: true, text: 'Skaven Presence Over Time', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
          tooltip: { ...tt, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
        },
      }}
    />
  );
}
