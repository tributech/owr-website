import { Radar } from 'react-chartjs-2';
import { regionData, C } from './data';
import { countryFlag } from '../../../lib/country-flag';
import type { ChartOptions } from 'chart.js';

const regionCodes: Record<string, string> = {
  'Australia': 'AU', 'Belgium': 'BE', 'Canada': 'CA', 'Denmark': 'DK',
  'Finland': 'FI', 'France': 'FR', 'Germany': 'DE', 'Ireland': 'IE',
  'Italy': 'IT', 'Japan': 'JP', 'Netherlands': 'NL', 'New Zealand': 'NZ',
  'Norway': 'NO', 'Online': 'ZZ', 'Poland': 'PL', 'Spain': 'ES',
  'Sweden': 'SE', 'Switzerland': 'CH', 'United Kingdom': 'UK', 'United States': 'US',
};

// Sort alphabetically for a clean radar layout
const sorted = [...regionData].sort((a, b) => a.name.localeCompare(b.name));

const options: ChartOptions<'radar'> = {
  responsive: true,
  scales: {
    r: {
      beginAtZero: true,
      max: 35,
      grid: { color: 'rgba(255,255,255,0.06)' },
      angleLines: { color: 'rgba(255,255,255,0.06)' },
      pointLabels: { color: '#e8e6e3', font: { size: 10 } },
      ticks: { display: true, stepSize: 5, callback: (v: string | number) => v + '%', color: '#5a5c63', backdropColor: 'transparent', font: { size: 9 } },
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'Legacy Player Share by Region (%)',
      color: '#e8e6e3',
      font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const },
      padding: { bottom: 12 },
    },
    legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
    tooltip: {
      backgroundColor: C.tooltipBg, borderColor: '#2a2e38', borderWidth: 1,
      padding: 10, cornerRadius: 8,
      callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r}%` },
    },
  },
};

export default function RegionChart() {
  const labels = sorted.map(r => {
    const flag = countryFlag(regionCodes[r.name] ?? null);
    return `${flag} ${r.name}`;
  });

  return (
    <Radar
      data={{
        labels,
        datasets: [
          {
            label: 'Official-Only',
            data: sorted.map(r => r.offPct),
            borderColor: C.off,
            backgroundColor: 'rgba(107,138,205,0.15)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: C.off,
          },
          {
            label: 'Renegade-Accepting',
            data: sorted.map(r => r.renPct),
            borderColor: C.ren,
            backgroundColor: 'rgba(201,92,76,0.15)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: C.ren,
          },
        ],
      }}
      options={options}
    />
  );
}
