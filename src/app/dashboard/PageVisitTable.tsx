'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Services } from '@/services/serviceapi';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type PageVisit = {
  id: string | number;
  keyName: string;
  countNumber: number;
  // Tambahkan kolom lain sesuai kebutuhan
};

const apiService = new Services();

const PageVisitTable = () => {
  const [pageVisit, setPageVisit] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchPageVisit = async () => {
      setLoading(true);

      const param = {
        page: page,
        pageSize: itemsPerPage,
      };
      try {
        const response = await apiService.getListPageVisit(param);

        setPageVisit(response.data.listView);
        setTotalItems(response.data.totalKey);
      } catch (error) {
        console.error('Error fetching page visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageVisit();
  }, [page, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  function truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Page Visit</h2>
              <Input
                type="number"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-24 mb-3"
                min={1}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <div className="bg-white rounded-lg p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URl</TableHead>
                  <TableHead>Page Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? [...Array(itemsPerPage)].map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                      </TableRow>
                    ))
                  : pageVisit.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{truncateText(item.keyName)}</TableCell>
                        <TableCell>{item.countNumber}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PageVisitTable;
