import { Line } from 'react-chartjs-2';
import { MONTHS, gtOffAvg, gtRenAvg, gtOffPct, gtRenPct, C } from './data';
import type { ChartOptions } from 'chart.js';

const baseOpts: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
    tooltip: { backgroundColor: C.tooltipBg, borderColor: '#2a2e38', borderWidth: 1, padding: 10, cornerRadius: 8 },
  },
};

function lineDs(label: string, data: (number | null)[], color: string, fill: string) {
  return {
    label, data, borderColor: color, backgroundColor: fill,
    borderWidth: 2, pointRadius: 3, pointBackgroundColor: color,
    tension: 0.3, fill: true, spanGaps: false,
  };
}

export function DiversityLineChart() {
  return (
    <Line
      data={{
        labels: [...MONTHS],
        datasets: [
          lineDs('Official GTs', gtOffAvg, C.off, C.offFill),
          lineDs('Renegade GTs', gtRenAvg, C.ren, C.renFill),
        ],
      }}
      options={{
        ...baseOpts,
        scales: {
          y: { beginAtZero: true, max: 7, grid: { color: C.gridLine }, ticks: { stepSize: 1 }, title: { display: true, text: 'Distinct Factions', color: '#5a5c63', font: { size: 10 } } },
          x: { grid: { display: false } },
        },
        plugins: {
          ...baseOpts.plugins,
          title: { display: true, text: 'Faction Diversity per GT', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
        },
      }}
    />
  );
}

export function PlayerShareLineChart() {
  return (
    <Line
      data={{
        labels: [...MONTHS],
        datasets: [
          lineDs('Official GTs', gtOffPct, C.off, C.offFill),
          lineDs('Renegade GTs', gtRenPct, C.ren, C.renFill),
        ],
      }}
      options={{
        ...baseOpts,
        scales: {
          y: { beginAtZero: true, max: 30, grid: { color: C.gridLine }, ticks: { callback: (v) => v + '%' }, title: { display: true, text: 'Legacy Player %', color: '#5a5c63', font: { size: 10 } } },
          x: { grid: { display: false } },
        },
        plugins: {
          ...baseOpts.plugins,
          title: { display: true, text: 'Player Share per GT', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          tooltip: { ...baseOpts.plugins?.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
        },
      }}
    />
  );
}
