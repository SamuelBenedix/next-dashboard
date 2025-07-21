'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Services } from '@/services/serviceapi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from './dataTable';
import { getColumns } from './columns';

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

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    const jwtparsing = localStorage.getItem('jwtParse');
    if (jwtparsing) {
      const parsed = JSON.parse(jwtparsing);
      setEmail(parsed.Email);
    }

    try {
      const response = await apiService.getListDoc();
      if (response.sign) {
        setDocs(response.sign);
        setTotalItems(response.sign.length);
        setItems(response.sign);
        setPageCount(Math.ceil(response.sign.length / itemsPerPage));
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error?.response?.status === 401) {
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

  const signNow = (id: number) => {
    sessionStorage.setItem('id', String(id));
    router.push('/documents/create');
  };

  const download = async (id: number, fileName: string) => {
    const formData = new FormData();
    formData.append('idFile', id.toString());
    try {
      const res = await apiService.downloadCertified(formData);
      const blobUrl = URL.createObjectURL(res.data);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  useEffect(() => {
    logMonitoring();
    fetchData();
  }, []);

  return (
    <AppLayout
      breadcrumb={{
        parent: { name: 'Dashboard' },
        current: 'Documents',
      }}
    >
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        data={items}
        columns={getColumns({
          onDownload: download,
          onSign: signNow,
        })}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Change document data or metadata here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-name">File Name</Label>
              <Input
                id="file-name"
                defaultValue={selectedDoc?.fileName ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="send-to">Send To</Label>
              <Input id="send-to" defaultValue={selectedDoc?.sendTo ?? ''} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
