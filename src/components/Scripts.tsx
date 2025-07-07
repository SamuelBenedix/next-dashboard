'use client';

import Script from 'next/script';

export default function DashboardScripts() {
  return (
    <>
      <Script
        src="/assets/vendor/libs/jquery/jquery.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/libs/popper/popper.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/js/bootstrap.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"
        strategy="afterInteractive"
      />
      <Script src="/assets/vendor/js/menu.js" strategy="afterInteractive" />
      <Script
        src="/assets/vendor/libs/apex-charts/apexcharts.js"
        strategy="afterInteractive"
      />
      {/* <Script src="/assets/js/main.js" strategy="afterInteractive" /> */}
      {/* <Script
        src="/assets/js/dashboards-analytics.js"
        strategy="afterInteractive"
      /> */}
      <Script
        src="https://buttons.github.io/buttons.js"
        strategy="afterInteractive"
        async
        defer
      />
    </>
  );
}
