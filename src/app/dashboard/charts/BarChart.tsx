// components/charts/BarChart.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  options: ApexOptions;
  series: ApexAxisChartSeries;
  height?: number;
};

export default function BarChart({ options, series, height = 350 }: Props) {
  return (
    <ApexCharts options={options} series={series} type="bar" height={height} />
  );
}
