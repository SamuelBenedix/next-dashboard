'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { SearchInput } from './ui/search-input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // for App Router

interface AppLayoutProps {
  children: ReactNode;
  breadcrumb?: {
    parent?: { name: string; href?: string };
    current: string;
  };
  onCreate?: () => void; // Optional callback for create action
  isCreate?: boolean; // Optional prop to indicate if this is a create page
  createButtonText?: string; // Optional text for create button
}

export default function AppLayout({
  children,
  breadcrumb,
  isCreate,
}: AppLayoutProps) {
  const router = useRouter();
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          {/* Left section: Sidebar + Breadcrumb */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {breadcrumb && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumb.parent && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={breadcrumb.parent.href || '#'}>
                          {breadcrumb.parent.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumb.current}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          {isCreate ? (
            <div></div>
          ) : (
            <div className="min-w-[500px] max-w-sm w-full flex">
              <SearchInput onSearch={handleSearch} placeholder="Search..." />
              <Button
                className="mx-5 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push('/documents/create')}
              >
                Create Documents
              </Button>
            </div>
          )}
          {/* Right section: Search */}
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
