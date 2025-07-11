'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash2Icon, EyeIcon, ArrowUpDown, Edit2Icon } from 'lucide-react';

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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.original.status}</div>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>${row.original.amount}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Add Button */}
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onAdd(payment)}
          >
            <Edit2Icon className="w-4 h-4 text-green-600" />
          </Button>

          {/* View Button */}
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onView(payment)}
          >
            <EyeIcon className="w-4 h-4 text-blue-600" />
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
