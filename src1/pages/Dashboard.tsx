import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { EnhancedDashboard } from '@/components/Dashboard/EnhancedDashboard';

export default function Dashboard() {
  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Modern Enhanced Dashboard */}
        <EnhancedDashboard />
      </div>
    </Layout>
  );
}