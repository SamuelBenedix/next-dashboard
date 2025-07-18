'use client';

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
        parent: { name: 'Dashboard' },
        current: 'Master',
      }}
    >
      <DataTable data={data} columns={columns} />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.{selectedPayment?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
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
