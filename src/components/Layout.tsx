// app/layout.js
export const metadata = {
  title: 'Sneat Dashboard',
  description: 'Admin dashboard using Sneat template',
};

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Script from 'next/script';
import Footer from './Footer';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* <meta charset="utf-8" /> */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
        />

        <title>
          Demo : Dashboard - Analytics | sneat - Bootstrap Dashboard PRO
        </title>

        <meta name="description" content="" />

        <link
          rel="icon"
          type="image/x-icon"
          href="../assets/img/favicon/favicon.ico"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />

        <link rel="stylesheet" href="../assets/vendor/fonts/boxicons.css" />

        <link
          rel="stylesheet"
          href="../assets/vendor/css/core.css"
          className="template-customizer-core-css"
        />
        <link
          rel="stylesheet"
          href="../assets/vendor/css/theme-default.css"
          className="template-customizer-theme-css"
        />
        <link rel="stylesheet" href="../assets/css/demo.css" />

        <link
          rel="stylesheet"
          href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css"
        />
        <link
          rel="stylesheet"
          href="../assets/vendor/libs/apex-charts/apex-charts.css"
        />

        <Script src="../assets/vendor/js/helpers.js"></Script>
        <Script src="../assets/js/config.js"></Script>
      </head>

      <body>
        <div className="layout-wrapper layout-content-navbar">
          <div className="layout-container">
            <Sidebar></Sidebar>

            <div className="layout-page">
              <Navbar></Navbar>
              <div className="content-wrapper">
                {children}
                <Footer />
              </div>
            </div>
          </div>
        </div>

        {/* <Navbar></Navbar>
        {children} */}
      </body>
    </html>
  );
}
