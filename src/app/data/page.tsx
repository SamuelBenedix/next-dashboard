'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { DataTable } from './dataTable';
import { getColumns } from './columns';
import { useState } from 'react';
import AppLayout from '@/components/app-layout';

type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

const data: Payment[] = [
  {
    id: 'm5gr84i9',
    amount: 316,
    status: 'success',
    email: 'ken99@example.com',
  },
  {
    id: '3u1reuv4',
    amount: 242,
    status: 'success',
    email: 'Abe45@example.com',
  },
  {
    id: 'derv1ws0',
    amount: 837,
    status: 'processing',
    email: 'Monserrat44@example.com',
  },
  {
    id: '5kma53ae',
    amount: 874,
    status: 'success',
    email: 'Silas22@example.com',
  },
  {
    id: 'bhqecj4p',
    amount: 721,
    status: 'failed',
    email: 'carmella@example.com',
  },
];

export default function DataPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleView = (payment: Payment) => {
    console.log('Viewing', payment);
  };

  const handleAdd = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsAddModalOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    console.log('Deleting', payment);
  };

  const columns = getColumns({
    onView: handleView,
    onAdd: handleAdd,
    onDelete: handleDelete,
  });

  return (
    <AppLayout
      breadcrumb={{
        parent: { name: 'Building Your Application' },
        current: 'Data Test',
      }}
    >
      <DataTable data={data} columns={columns} />
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add for: {selectedPayment?.status || 'N/A'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>Form to add something for this payment</p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
