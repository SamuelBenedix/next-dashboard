'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

export type Payment = {
  id: number;
  fileName: string;
  sendBy: string;
  sendTo: string;
  status: number;
};

interface ColumnActions {
  onDownload: (id: number, fileName: string) => void;
  onSign: (id: number) => void;
}

export const getColumns = ({
  onDownload,
  onSign,
}: ColumnActions): ColumnDef<Payment>[] => [
  {
    accessorKey: 'fileName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Documents
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.fileName}</div>,
  },
  {
    accessorKey: 'sendBy',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created By
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.sendBy}</div>,
  },
  {
    accessorKey: 'sendTo',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Send To
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.sendTo}</div>,
  },
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
    cell: ({ row }) => {
      const status = row.original.status;

      let color:
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | null
        | undefined = 'default';
      let label = 'Unknown';

      switch (status) {
        case 1:
        case 3:
          label = 'Completed';
          color = 'default'; // atau 'success' jika kamu pakai varian lain
          break;
        case 0:
        case 2:
        default:
          label = 'In Progress';
          color = 'secondary'; // abu-abu
          break;
      }

      return <Badge variant={color}>{label}</Badge>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          {payment.status === 3 ? (
            <Button
              variant="default"
              className="h-8 px-3"
              onClick={() => onDownload(payment.id, payment.fileName)}
            >
              Download
            </Button>
          ) : (
            <Button
              variant="default"
              className="h-8 px-3"
              onClick={() => onSign(payment.id)}
            >
              Sign Now
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
