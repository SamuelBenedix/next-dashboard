/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { AppSidebar } from '@/components/app-sidebar';
import type { ApexOptions } from 'apexcharts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import React, { useEffect, useState } from 'react';
import { Services } from '@/services/serviceapi';
import PageVisitTable from './PageVisitTable';
import PieChartComponent from './PieChartDocuments';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import GroupedBarChart from './charts/GroupedBarChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

const apiService = new Services();

interface BrowserData {
  keyName: string;
  countNumber: number;
}

export interface APIResponseItem {
  keyDateTime: string;
  listOS: {
    keyName: string;
    countNumber: number;
  }[];
}

export interface SeriesData {
  name: string;
  data: number[];
}

export default function Page() {
  const [selectedLogType, setSelectedLogType] = useState('Daily');
  const [seriesDataLogin, setSeriesDataLogin] = useState([
    { name: 'Login', data: [] as number[] },
  ]);
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [categories, setCategories] = useState<string[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [selectedLogOS, setSelectedLogOS] = useState('Daily');
  const [chartOptions, setChartOptions] = useState<string[]>();
  const [seriesDataOS, setSeriesDataOS] = useState<SeriesData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const userDetail = JSON.parse(localStorage.getItem('jwtParse') || '{}');
      showLoading('Memuat data grafik...');
      try {
        if (userDetail?.Role_Name?.includes('Admin')) {
          await Promise.all([
            updateChartDataLogin(),
            updateChartDataOS(),
            fetchDataBrowser(),
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);

  const updateChartDataLogin = async () => {
    try {
      const response = await apiService.loginMonitoring(selectedLogType);
      const categorie: string[] = [];
      const dataseries: number[] = [];

      response.data.forEach((item: BrowserData) => {
        categorie.push(item.keyName);
        dataseries.push(item.countNumber);
      });

      setCategories(categorie);
      setSeriesDataLogin([
        {
          name: selectedLogType,
          data: dataseries,
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateChartDataOS = async () => {
    const type = selectedLogOS;
    try {
      const response = await apiService.getOSData(type);
      const data: APIResponseItem[] = response.data;

      const categorie: string[] = [];
      const seriesDataMap: Record<string, number[]> = {};

      data.forEach((item: APIResponseItem) => {
        categorie.push(item.keyDateTime);

        item.listOS.forEach((os) => {
          if (!seriesDataMap[os.keyName]) {
            seriesDataMap[os.keyName] = [];
          }
          seriesDataMap[os.keyName].push(os.countNumber);
        });
      });

      const seriesDataArray: SeriesData[] = Object.entries(seriesDataMap).map(
        ([name, data]) => ({
          name,
          data,
        })
      );

      setChartOptions(categorie);

      setSeriesDataOS(seriesDataArray);
    } catch (error) {
      console.error('Error fetching OS chart data:', error);
    }
  };

  const fetchDataBrowser = async () => {
    try {
      const responseData = await apiService.getBrowserData();
      const data: BrowserData[] = responseData.data;

      const labels: string[] = [];
      const series: number[] = [];

      data.forEach((item: BrowserData) => {
        labels.push(item.keyName);
        series.push(item.countNumber);
      });

      setChartLabels(labels);
      setChartSeries(series);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const options: ApexOptions = {
    chart: {
      id: 'basic-bar',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: categories,
    },
    colors: ['#0ea5e9'],
  };

  const optionsPieChart: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: chartLabels,
    legend: {
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const optionsGroupBar: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartOptions,
    },
    colors: ['#1E90FF', '#FF6347'],
    legend: {
      position: 'top',
    },
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="grid auto-rows-min gap-3 md:grid-cols-6 p-3">
          <div className="md:col-span-3 ">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Login Monitoring</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="capitalize">
                      {selectedLogType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['daily', 'monthly', 'yearly'].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() =>
                          setSelectedLogType(
                            item as 'daily' | 'monthly' | 'yearly'
                          )
                        }
                        className={selectedLogType === item ? 'font-bold' : ''}
                      >
                        {selectedLogType === item && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <div className="bg-white rounded-lg p-4">
                <BarChart options={options} series={seriesDataLogin} />
              </div>
            </Card>
          </div>
          <div className="md:col-span-3 ">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Browser</CardTitle>
              </CardHeader>
              <div className="bg-white rounded-lg p-4">
                <PieChart
                  height={385}
                  options={optionsPieChart}
                  series={chartSeries}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid auto-rows-min gap-3 md:grid-cols-6 p-3">
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Login OS</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="capitalize">
                      {selectedLogOS}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['daily', 'monthly', 'yearly'].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() =>
                          setSelectedLogOS(
                            item as 'daily' | 'monthly' | 'yearly'
                          )
                        }
                        className={selectedLogOS === item ? 'font-bold' : ''}
                      >
                        {selectedLogOS === item && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <div className="bg-white rounded-lg p-4">
                <GroupedBarChart
                  options={optionsGroupBar}
                  series={seriesDataOS}
                />
              </div>
            </Card>
          </div>
          <div className="md:col-span-3 aspect-video rounded-xl">
            <PageVisitTable />
          </div>
        </div>

        <PieChartComponent />
      </SidebarInset>
    </SidebarProvider>
  );
}
