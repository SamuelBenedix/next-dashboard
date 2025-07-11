'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon, EyeIcon } from 'lucide-react';

// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

interface ColumnActions {
  onView: (payment: Payment) => void;
  onAdd: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export const getColumns = ({
  onView,
  onAdd,
  onDelete,
}: ColumnActions): ColumnDef<Payment>[] => [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{row.original.status}</div>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => <div>${row.original.amount}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* View Button */}
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onView(payment)}
          >
            <EyeIcon className="w-4 h-4 text-blue-600" />
          </Button>

          {/* Add Button */}
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onAdd(payment)}
          >
            <PlusIcon className="w-4 h-4 text-green-600" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onDelete(payment)}
          >
            <Trash2Icon className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
