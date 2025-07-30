'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';

let resolver: (() => void) | null = null;

export function useAlertDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: '',
    description: '',
    variant: 'default' as 'default' | 'destructive' | 'success',
  });

  const showAlertDialog = useCallback(
    ({
      title,
      description,
      variant = 'default',
    }: {
      title: string;
      description: string;
      variant?: 'default' | 'destructive' | 'success';
    }) => {
      setData({ title, description, variant });
      setOpen(true);

      return new Promise<void>((resolve) => {
        resolver = resolve;
      });
    },
    []
  );

  const close = () => {
    setOpen(false);
    if (resolver) resolver();
  };

  const AlertDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={
              data.variant === 'destructive'
                ? 'text-red-600'
                : data.variant === 'success'
                ? 'text-green-600'
                : ''
            }
          >
            {data.title}
          </DialogTitle>
          <DialogDescription>{data.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center align-center">
          <Button
            variant="default"
            onClick={close}
            className={
              data.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : data.variant === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : ''
            }
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { showAlertDialog, AlertDialog };
}
