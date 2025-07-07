// app/layout.js
export const metadata = {
  title: 'Sneat Dashboard',
  description: 'Admin dashboard using Sneat template',
};

import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/img/favicon/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
