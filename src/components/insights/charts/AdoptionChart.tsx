import { Bar } from 'react-chartjs-2';
import { MONTHS, allOffVol, allRenVol, C } from './data';
import type { ChartOptions } from 'chart.js';

const options: ChartOptions<'bar'> = {
  responsive: true,
  scales: {
    y: { stacked: true, beginAtZero: true, grid: { color: C.gridLine }, title: { display: true, text: 'Events', color: '#5a5c63', font: { size: 10 } } },
    x: { stacked: true, grid: { display: false } },
  },
  plugins: {
    title: { display: true, text: 'Monthly Event Volume: Official vs Renegade-Accepting', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 12 } },
    legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
    tooltip: { backgroundColor: C.tooltipBg, borderColor: '#2a2e38', borderWidth: 1, padding: 10, cornerRadius: 8 },
  },
};

export default function AdoptionChart() {
  return (
    <Bar
      data={{
        labels: [...MONTHS],
        datasets: [
          { label: 'Official-Only', data: allOffVol, backgroundColor: C.offBg, borderColor: C.off, borderWidth: 1, borderRadius: 3 },
          { label: 'Renegade-Accepting', data: allRenVol, backgroundColor: C.renBg, borderColor: C.ren, borderWidth: 1, borderRadius: 3 },
        ],
      }}
      options={options}
    />
  );
}
