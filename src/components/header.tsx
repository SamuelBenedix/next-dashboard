'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation'; // tambahkan di atas

// Di dalam komponen Header
export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full px-4 py-3 shadow-sm border-b bg-white">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Image */}
        <div>
          <img src="/BNI_logo.svg" alt="e-Signature Logo" className="h-8" />
        </div>

        {/* Desktop: Login button */}
        <div className="hidden sm:block">
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
        </div>

        {/* Mobile: Menu Button */}
        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-4 space-y-4">
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
