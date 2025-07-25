// components/charts/PieChart.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  options: ApexOptions;
  series: ApexNonAxisChartSeries;
  height?: number;
};

export default function PieChart({ options, series, height = 350 }: Props) {
  return (
    <ApexCharts options={options} series={series} type="pie" height={height} />
  );
}
