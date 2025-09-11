import React from 'react';
import { Layout } from '@/components/Layout/Layout';

export default function Dashboard() {
  return (
    <Layout hideHeader={true}>
      <div className="w-full">
        {/* Test Dashboard */}
        <div className="min-h-screen bg-red-500 flex items-center justify-center">
          <div className="text-white text-4xl font-bold">
            DASHBOARD CHANGED SUCCESSFULLY!
          </div>
        </div>
      </div>
    </Layout>
  );
}