import { useEffect, useState, useRef } from 'react';
import { Services } from '@/services/serviceapi';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type BrowserData = {
  keyName: string;
  countNumber: number;
};

const apiService = new Services();
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PieChartComponent() {
  const [chartSeriesPieUpload, setChartSeriesPieUpload] = useState<number[]>(
    []
  );
  const [chartSeriesPieDownload, setChartSeriesPieDownload] = useState<
    number[]
  >([]);
  const [isLoadingPieDocument, setIsLoadingPieDocument] =
    useState<boolean>(false);

  const pieChartDownloadRef = useRef<ApexCharts | null>(null);
  const pieChartUploadRef = useRef<ApexCharts | null>(null);

  const chartOptionsPieDownload = {
    labels: ['Chrome', 'Firefox', 'Safari'], // Contoh, nanti bisa diganti dinamis
  };

  async function fetchDataDocument() {
    setIsLoadingPieDocument(true);
    try {
      const responseUpload = await apiService.getDocumentUploadDownload(
        'upload'
      );
      const responseDownload = await apiService.getDocumentUploadDownload(
        'Download'
      );

      const dataUpload: BrowserData[] = responseUpload.data;
      const dataDownload: BrowserData[] = responseDownload.data;

      const uploadCounts = dataUpload.map((item) => item.countNumber);
      const downloadCounts = dataDownload.map((item) => item.countNumber);

      setChartSeriesPieUpload(uploadCounts);
      setChartSeriesPieDownload(downloadCounts);

      // Update chart manually if needed
      pieChartDownloadRef.current?.updateOptions({
        labels: chartOptionsPieDownload.labels,
      });

      pieChartUploadRef.current?.updateOptions({
        labels: chartOptionsPieDownload.labels,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingPieDocument(false);
    }
  }

  useEffect(() => {
    fetchDataDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 p-3">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <div className="bg-white rounded-lg p-4">
          {isLoadingPieDocument ? (
            <p>Loading Upload Chart...</p>
          ) : (
            <ApexCharts
              options={{ ...chartOptionsPieDownload }}
              series={chartSeriesPieUpload}
              type="pie"
              height={350}
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Downlod</CardTitle>
        </CardHeader>
        <div className="bg-white rounded-lg p-4">
          {isLoadingPieDocument ? (
            <p>Loading Download Chart...</p>
          ) : (
            <ApexCharts
              options={{ ...chartOptionsPieDownload }}
              series={chartSeriesPieDownload}
              type="pie"
              height={350}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
