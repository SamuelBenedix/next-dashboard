/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Services } from '@/services/serviceapi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from './dataTable';
import { getColumns } from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

interface DocumentItem {
  id: number;
  fileName: string;
  sendBy: string;
  sendTo: string;
  status: number;
  isActive?: boolean;
}

export default function DataPage() {
  const apiService = new Services();
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [pageCount, setPageCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await apiService.getListDoc('2');

      console.log('response', response);
      if (response.sign) {
        setDocs(response.sign);
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response ===
          'object' &&
        (error as { response?: { status?: number } }).response?.status === 401
      ) {
        alert('Check your internet');
      }
    }
    setIsLoading(false);
  };

  const logMonitoring = async () => {
    try {
      await apiService.logMonitoring('/documents');
    } catch (error) {
      console.error('Error monitoring:', error);
    }
  };

  const filteredDocs = useMemo(() => {
    if (!search) return docs;
    const keyword = search.toLowerCase();
    return docs.filter((doc) =>
      Object.values(doc).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [search, docs]);

  const updatePaginatedItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);
    setItems(paginatedDocs);
    setPageCount(Math.ceil(filteredDocs.length / itemsPerPage));
  };

  const signNow = (id: number) => {
    if (!id) return;
    router.push(`/sign-now/${id}`);
  };

  const download = async (id: number, fileName: string) => {
    const formData = new FormData();
    formData.append('idFile', id.toString());
    showLoading();
    try {
      const res = await apiService.downloadCertified(formData);
      const blob = new Blob([res.data]);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      showLoading();
      try {
        await logMonitoring();
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        hideLoading();
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    logMonitoring();
    fetchData();
  }, []);

  useEffect(() => {
    updatePaginatedItems();
  }, [filteredDocs, page]);

  return (
    <AppLayout
      breadcrumb={{
        parent: { name: 'Dashboard' },
        current: 'Draft',
      }}
    >
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset ke halaman 1 saat search berubah
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <DataTable
          data={items}
          columns={getColumns({
            onDownload: download,
            onSign: signNow,
          })}
        />
      )}
      {/* Pagination controls */}
      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="self-center">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
          disabled={page === pageCount}
        >
          Next
        </Button>
      </div>
    </AppLayout>
  );
}
