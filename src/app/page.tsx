// pages/index.js
import Head from 'next/head';
import Layout from '../components/Layout';
import DashboardScripts from '@/components/Scripts';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sneat Dashboard</title>
        <link rel="icon" href="/assets/img/favicon/favicon.ico" />
      </Head>

      <Layout>
        <div className="container-xxl flex-grow-1 container-p-y">
          <h4>Welcome to Sneat Dashboard</h4>
        </div>
      </Layout>

      <DashboardScripts />
    </>
  );
}
