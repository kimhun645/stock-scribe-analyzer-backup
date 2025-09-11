import React from 'react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Activity, ArrowUp, ArrowDown, Package, BarChart3 } from 'lucide-react';
import { AddMovementDialog } from '@/components/Dialogs/AddMovementDialog';

interface MovementsHeaderProps {
  todayStockIn: number;
  todayStockOut: number;
  totalMovements: number;
  totalValue: number;
  onMovementAdded: () => void;
}

export function MovementsHeader({
  todayStockIn,
  todayStockOut,
  totalMovements,
  totalValue,
  onMovementAdded
}: MovementsHeaderProps) {
  return (
    <PageHeader 
      title="การเคลื่อนไหวสต็อก"
      description="ติดตามและจัดการการรับเข้าและเบิกออกสต็อกทั้งหมด พร้อมระบบติดตามและแจ้งเตือนอัตโนมัติ"
      icon={Activity}
      stats={[
        {
          label: "รับเข้าวันนี้",
          value: todayStockIn.toString(),
          icon: ArrowUp,
          gradient: "from-green-600 to-emerald-600"
        },
        {
          label: "เบิกออกวันนี้", 
          value: todayStockOut.toString(),
          icon: ArrowDown,
          gradient: "from-red-600 to-pink-600"
        },
        {
          label: "รายการทั้งหมด",
          value: totalMovements.toLocaleString(),
          icon: Package,
          gradient: "from-blue-600 to-cyan-600"
        },
        {
          label: "มูลค่ารวม",
          value: `฿${totalValue.toLocaleString()}`,
          icon: BarChart3,
          gradient: "from-emerald-600 to-teal-600"
        }
      ]}
      secondaryActions={<AddMovementDialog onMovementAdded={onMovementAdded} />}
    />
  );
}
