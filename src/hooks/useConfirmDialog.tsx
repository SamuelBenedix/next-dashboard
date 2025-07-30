'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'; // Optional icons

let resolver: (result: boolean) => void = () => {};

type Variant = 'info' | 'warning' | 'error' | 'success';

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info' as Variant,
  });

  const showConfirmDialog = useCallback(
    (opts: {
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      variant?: Variant;
    }) => {
      setOptions({
        title: opts.title,
        description: opts.description,
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        variant: opts.variant || 'info',
      });
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        resolver = resolve;
      });
    },
    []
  );

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolver(result);
  };

  const getVariantStyles = (variant: Variant) => {
    switch (variant) {
      case 'warning':
        return {
          icon: <AlertCircle className="text-yellow-500 w-6 h-6" />,
          confirmButton: 'bg-yellow-500 text-white hover:bg-yellow-600',
        };
      case 'error':
        return {
          icon: <XCircle className="text-red-500 w-6 h-6" />,
          confirmButton: 'bg-red-600 text-white hover:bg-red-700',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="text-green-600 w-6 h-6" />,
          confirmButton: 'bg-green-600 text-white hover:bg-green-700',
        };
      default:
        return {
          icon: <Info className="text-blue-600 w-6 h-6" />,
          confirmButton: 'bg-blue-600 text-white hover:bg-blue-700',
        };
    }
  };

  const { icon, confirmButton } = getVariantStyles(options.variant);

  const ConfirmDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-3">
          {icon}
          <div>
            <DialogTitle>{options.title}</DialogTitle>
            <DialogDescription>{options.description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            {options.cancelText}
          </Button>
          <Button className={confirmButton} onClick={() => handleClose(true)}>
            {options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { showConfirmDialog, ConfirmDialog };
}
