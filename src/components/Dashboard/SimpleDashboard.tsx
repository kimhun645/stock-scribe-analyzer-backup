import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  AlertCircle,
  DollarSign,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SimpleStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentMovements: number;
  pendingApprovals: number;
}

export function SimpleDashboard() {
  const [stats, setStats] = useState<SimpleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockStats: SimpleStats = {
        totalProducts: 1250,
        lowStockItems: 23,
        outOfStockItems: 5,
        totalValue: 2500000,
        recentMovements: 45,
        pendingApprovals: 8
      };
      
      setStats(mockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600">สวัสดี {user?.displayName || user?.email}, ยินดีต้อนรับสู่ระบบบริหารพัสดุ</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">
              รายการสินค้าในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าใกล้หมด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatNumber(stats.lowStockItems)}</div>
            <p className="text-xs text-muted-foreground">
              ต้องเติมสต็อก
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าหมด</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(stats.outOfStockItems)}</div>
            <p className="text-xs text-muted-foreground">
              ต้องสั่งซื้อด่วน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              มูลค่าสต็อกทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              สรุปกิจกรรม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">การเคลื่อนไหวสต็อก</p>
                    <p className="text-sm text-green-600">{stats.recentMovements} รายการวันนี้</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.recentMovements}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">รอการอนุมัติ</p>
                    <p className="text-sm text-amber-600">{stats.pendingApprovals} รายการต้องดำเนินการ</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600">{stats.pendingApprovals}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              สถิติการใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ผู้ใช้งานออนไลน์</span>
                <Badge variant="secondary">1 คน</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">อัปเดตล่าสุด</span>
                <span className="text-sm text-gray-500">{lastUpdated.toLocaleTimeString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">สถานะระบบ</span>
                <Badge className="bg-green-100 text-green-700">ปกติ</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        อัปเดตล่าสุด: {lastUpdated.toLocaleString('th-TH')}
      </div>
    </div>
  );
}
