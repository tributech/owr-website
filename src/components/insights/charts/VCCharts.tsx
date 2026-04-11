import { Doughnut, Bar } from 'react-chartjs-2';
import {
  MONTHS, vcDoughnutLabels, vcDoughnutData,
  vcOffPlayers, nvOffPlayers, vcRenPlayers, nvRenPlayers,
  vcCompareLabels, vcCompareOfficial, vcCompareRenegade, C,
} from './data';
import type { ChartOptions } from 'chart.js';

const tt = { backgroundColor: C.tooltipBg, borderColor: '#2a2e38', borderWidth: 1, padding: 10, cornerRadius: 8 } as const;

export function VCDoughnut() {
  return (
    <Doughnut
      data={{
        labels: vcDoughnutLabels,
        datasets: [{
          data: vcDoughnutData,
          backgroundColor: ['rgba(139,92,246,0.7)','rgba(201,92,76,0.6)','rgba(201,168,76,0.6)','rgba(107,138,205,0.6)','rgba(76,175,80,0.5)','rgba(255,159,64,0.5)','rgba(54,162,235,0.5)'],
          borderColor: '#1C1C1C', borderWidth: 2,
        }],
      }}
      options={{
        responsive: true, cutout: '55%',
        plugins: {
          title: { display: true, text: 'VC Share of Official GT Legacy Players', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { position: 'right' as const, labels: { font: { size: 9 }, padding: 6, usePointStyle: true, pointStyle: 'rectRounded' as const } },
          tooltip: tt,
        },
      }}
    />
  );
}

export function VCStackChart() {
  return (
    <Bar
      data={{
        labels: [...MONTHS],
        datasets: [
          { label: 'VC (Official)', data: vcOffPlayers, backgroundColor: 'rgba(139,92,246,0.5)', borderColor: C.vc, borderWidth: 1, borderRadius: 2, stack: 'off' },
          { label: 'Non-VC (Official)', data: nvOffPlayers, backgroundColor: 'rgba(107,138,205,0.4)', borderColor: C.off, borderWidth: 1, borderRadius: 2, stack: 'off' },
          { label: 'VC (Renegade)', data: vcRenPlayers, backgroundColor: 'rgba(139,92,246,0.3)', borderColor: C.vc, borderWidth: 1, borderRadius: 2, stack: 'ren' },
          { label: 'Non-VC (Renegade)', data: nvRenPlayers, backgroundColor: 'rgba(201,92,76,0.3)', borderColor: C.ren, borderWidth: 1, borderRadius: 2, stack: 'ren' },
        ],
      }}
      options={{
        responsive: true,
        scales: {
          y: { stacked: true, beginAtZero: true, max: 90, grid: { color: C.gridLine }, title: { display: true, text: 'Players', color: '#5a5c63', font: { size: 10 } } },
          x: { stacked: true, grid: { display: false } },
        },
        plugins: {
          title: { display: true, text: 'VC vs Other Legacy (GT Players)', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 10, font: { size: 9 } } },
          tooltip: tt,
        },
      }}
    />
  );
}

export function VCCompareChart() {
  return (
    <Bar
      data={{
        labels: vcCompareLabels,
        datasets: [
          { label: 'Official GTs', data: vcCompareOfficial, backgroundColor: 'rgba(107,138,205,0.6)', borderColor: C.off, borderWidth: 1, borderRadius: 4 },
          { label: 'Renegade GTs', data: vcCompareRenegade, backgroundColor: 'rgba(201,92,76,0.6)', borderColor: C.ren, borderWidth: 1, borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true, indexAxis: 'y' as const,
        scales: { x: { beginAtZero: true, grid: { color: C.gridLine } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
        plugins: {
          title: { display: true, text: 'The VC Effect: With vs Without Vampire Counts', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
          tooltip: tt,
        },
      }}
    />
  );
}
