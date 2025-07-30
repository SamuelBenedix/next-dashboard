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

let resolver: (result: boolean) => void = () => {};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const showConfirmDialog = useCallback(
    (opts: {
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
    }) => {
      setOptions({
        title: opts.title,
        description: opts.description,
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
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

  const ConfirmDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>{options.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            {options.cancelText}
          </Button>
          <Button onClick={() => handleClose(true)}>
            {options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { showConfirmDialog, ConfirmDialog };
}
