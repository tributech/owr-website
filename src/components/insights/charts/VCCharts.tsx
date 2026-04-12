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
  // Combine official + renegade into totals per month
  const vcTotal = vcOffPlayers.map((v, i) => v + (vcRenPlayers[i] ?? 0));
  const nvTotal = nvOffPlayers.map((v, i) => v + (nvRenPlayers[i] ?? 0));

  return (
    <Bar
      data={{
        labels: [...MONTHS],
        datasets: [
          { label: 'Vampire Counts', data: vcTotal, backgroundColor: 'rgba(139,92,246,0.75)', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 3, stack: 'legacy' },
          { label: 'All Other Legacy', data: nvTotal, backgroundColor: 'rgba(20,184,166,0.65)', borderColor: '#14b8a6', borderWidth: 1, borderRadius: 3, stack: 'legacy' },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { stacked: true, beginAtZero: true, grid: { color: C.gridLine }, title: { display: true, text: 'GT Legacy Players', color: '#5a5c63', font: { size: 10 } } },
          x: { stacked: true, grid: { display: false } },
        },
        plugins: {
          title: { display: true, text: 'Vampire Counts vs All Other Legacy (GT Players)', color: '#e8e6e3', font: { family: "'Montserrat', sans-serif", size: 13, weight: 600 as const }, padding: { bottom: 10 } },
          legend: { labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 14 } },
          tooltip: tt,
        },
      }}
    />
  );
}

export function VCCompareChart() {
  // Dim "with VC" rows (0,2), bright "no VC" rows (1,3)
  const offBg = ['rgba(107,138,205,0.25)','rgba(107,138,205,0.8)','rgba(107,138,205,0.25)','rgba(107,138,205,0.8)'];
  const renBg = ['rgba(201,92,76,0.25)','rgba(201,92,76,0.8)','rgba(201,92,76,0.25)','rgba(201,92,76,0.8)'];
  const offBorder = ['rgba(107,138,205,0.4)', C.off, 'rgba(107,138,205,0.4)', C.off];
  const renBorder = ['rgba(201,92,76,0.4)', C.ren, 'rgba(201,92,76,0.4)', C.ren];
  const bw = [1, 2, 1, 2];

  return (
    <Bar
      data={{
        labels: vcCompareLabels,
        datasets: [
          { label: 'Official GTs', data: vcCompareOfficial, backgroundColor: offBg, borderColor: offBorder, borderWidth: bw, borderRadius: 4 },
          { label: 'Renegade GTs', data: vcCompareRenegade, backgroundColor: renBg, borderColor: renBorder, borderWidth: bw, borderRadius: 4 },
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
