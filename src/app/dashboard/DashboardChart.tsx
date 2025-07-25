// components/DashboardCharts.tsx
import React from 'react';
import ApexCharts from 'react-apexcharts';

type ApexChartProps = {
  barOptions: ApexCharts.ApexOptions;
  barSeries: ApexAxisChartSeries;
  pieOptions: ApexCharts.ApexOptions;
  pieSeries: ApexNonAxisChartSeries;
  osBarOptions: ApexCharts.ApexOptions;
  osBarSeries: ApexAxisChartSeries;
};

export default function DashboardCharts({
  barOptions,
  barSeries,
  pieOptions,
  pieSeries,
  osBarOptions,
  osBarSeries,
}: ApexChartProps) {
  return (
    <>
      <div className="grid auto-rows-min gap-3 md:grid-cols-6">
        <div className="md:col-span-3">
          <ApexCharts
            options={barOptions}
            series={barSeries}
            type="bar"
            height={350}
          />
        </div>
        <div className="md:col-span-3 aspect-video rounded-xl">
          <ApexCharts
            options={pieOptions}
            series={pieSeries}
            type="pie"
            height={350}
          />
        </div>
      </div>

      <div className="grid auto-rows-min gap-3 md:grid-cols-6">
        <div className="md:col-span-3">
          <ApexCharts
            options={osBarOptions}
            series={osBarSeries}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </>
  );
}
