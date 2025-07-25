'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  FileText,
  Inbox,
  FilePen,
  ActivitySquare,
  LayoutDashboard,
  GalleryVerticalEnd,
} from 'lucide-react';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Services } from '@/services/serviceapi';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
  ],

  projects: [
    {
      name: 'All Documents',
      url: '/documents',
      icon: FileText, // Ikon dokumen
    },
    {
      name: 'Inbox',
      url: '/inbox',
      icon: Inbox, // Ikon kotak masuk
    },
    {
      name: 'Draft',
      url: '/draft',
      icon: FilePen, // Ikon dokumen yang sedang diedit
    },
    {
      name: 'Monitoring',
      url: '/monitoring',
      icon: ActivitySquare, // Ikon pemantauan / monitoring
    },
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard, // Ikon dashboard umum
    },
  ],
};

const apiService = new Services();

interface UserDetail {
  Nama_Pegawai: string;
  Npp: string;
  Role_Name: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userDetailString = localStorage.getItem('jwtParse');

    if (userDetailString) {
      const parsed = JSON.parse(userDetailString);
      setUserDetail(parsed);
    } else if (
      typeof window !== 'undefined' &&
      window.location.href.split('/').length === 6
    ) {
      const urlParts = window.location.href.split('/');
      const token = urlParts[urlParts.length - 1];
      const idDoc = urlParts[urlParts.length - 2];
      const jWTParse = apiService.parseJwt(token);

      sessionStorage.setItem('id', idDoc);
      localStorage.setItem('jwT_Token', token);
      localStorage.setItem('jwtParse', JSON.stringify(jWTParse));

      setUserDetail({
        Nama_Pegawai: jWTParse.Nama_Pegawai,
        Npp: jWTParse.Npp,
        Role_Name: jWTParse.Role_Name,
      });
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center h-16">
          <Image src="/BNI_logo.svg" width={120} height={120} alt="BNI Logo" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            userDetail
              ? {
                  name: userDetail.Nama_Pegawai,
                  email: userDetail.Npp,
                  avatar: '/avatars/default.jpg', // Provide a default avatar or map accordingly
                }
              : {
                  name: 'Guest',
                  email: 'guest@example.com',
                  avatar: '/avatars/default.jpg',
                }
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
