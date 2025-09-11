import React from 'react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { AddProductDialog } from '@/components/Dialogs/AddProductDialog';

interface ProductsHeaderProps {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  onProductAdded: () => void;
}

export function ProductsHeader({
  totalProducts,
  lowStockProducts,
  outOfStockProducts,
  totalValue,
  onProductAdded
}: ProductsHeaderProps) {
  return (
    <PageHeader 
      title="สินค้า"
      description="จัดการสินค้าและสต็อกอย่างครบถ้วน พร้อมระบบติดตามและแจ้งเตือนอัตโนมัติ"
      icon={Package}
      stats={[
        {
          label: "สินค้าทั้งหมด",
          value: totalProducts.toString(),
          icon: Package,
          gradient: "from-blue-600 to-cyan-600"
        },
        {
          label: "สต็อกต่ำ",
          value: lowStockProducts.toString(),
          icon: AlertTriangle,
          gradient: lowStockProducts > 0 ? "from-orange-600 to-amber-600" : "from-gray-500 to-gray-600",
          color: lowStockProducts > 0 ? "bg-gradient-to-br from-orange-600 to-amber-600" : "bg-gradient-to-br from-gray-500 to-gray-600"
        },
        {
          label: "หมดสต็อก",
          value: outOfStockProducts.toString(),
          icon: TrendingUp,
          gradient: outOfStockProducts > 0 ? "from-red-600 to-pink-600" : "from-gray-500 to-gray-600",
          color: outOfStockProducts > 0 ? "bg-gradient-to-br from-red-600 to-pink-600" : "bg-gradient-to-br from-gray-500 to-gray-600"
        },
        {
          label: "มูลค่ารวม",
          value: `฿${totalValue.toLocaleString()}`,
          icon: BarChart3,
          gradient: "from-emerald-600 to-teal-600"
        }
      ]}
      secondaryActions={<AddProductDialog onProductAdded={onProductAdded} />}
    />
  );
}
