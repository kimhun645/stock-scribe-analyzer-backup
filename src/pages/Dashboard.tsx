import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { TemplateDashboard } from '@/components/Dashboard/TemplateDashboard';

export default function Dashboard() {
  return (
    <Layout hideHeader={true}>
      <div className="w-full">
        {/* Template-based Dashboard */}
        <TemplateDashboard />
      </div>
    </Layout>
  );
}