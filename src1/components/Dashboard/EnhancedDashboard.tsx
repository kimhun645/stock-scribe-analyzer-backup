import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Clock,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  Settings,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentMovements: number;
  pendingApprovals: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
  totalSuppliers: number;
  totalCategories: number;
  averageStockValue: number;
  topCategories: Array<{ name: string; count: number; value: number; percentage: number }>;
  recentActivities: Array<{ 
    id: string; 
    type: 'in' | 'out' | 'adjustment'; 
    product: string; 
    quantity: number; 
    time: string; 
    status: 'completed' | 'pending' | 'failed' 
  }>;
}

export function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { getStockLevel } = useStock();
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockStats: DashboardStats = {
        totalProducts: 1250,
        lowStockItems: 23,
        outOfStockItems: 5,
        totalValue: 2500000,
        recentMovements: 45,
        pendingApprovals: 8,
        monthlyGrowth: 12.5,
        weeklyGrowth: 3.2,
        totalSuppliers: 45,
        totalCategories: 12,
        averageStockValue: 2000,
        topCategories: [
          { name: 'อิเล็กทรอนิกส์', count: 450, value: 1200000, percentage: 48 },
          { name: 'เสื้อผ้า', count: 320, value: 800000, percentage: 32 },
          { name: 'ของใช้ในบ้าน', count: 280, value: 500000, percentage: 20 }
        ],
        recentActivities: [
          { id: '1', type: 'in', product: 'iPhone 15 Pro', quantity: 50, time: '2 นาทีที่แล้ว', status: 'completed' },
          { id: '2', type: 'out', product: 'MacBook Air M2', quantity: 12, time: '15 นาทีที่แล้ว', status: 'completed' },
          { id: '3', type: 'adjustment', product: 'Samsung Galaxy S24', quantity: -5, time: '1 ชั่วโมงที่แล้ว', status: 'pending' },
          { id: '4', type: 'in', product: 'iPad Pro 12.9"', quantity: 25, time: '2 ชั่วโมงที่แล้ว', status: 'completed' },
          { id: '5', type: 'out', product: 'AirPods Pro', quantity: 8, time: '3 ชั่วโมงที่แล้ว', status: 'completed' }
        ]
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
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
          <p className="text-gray-600">สวัสดี {user?.displayName || user?.email}, ยินดีต้อนรับสู่ระบบจัดการสต็อก</p>
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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่า
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats.weeklyGrowth}% จากสัปดาห์ที่แล้ว
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าใกล้หมด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatNumber(stats.lowStockItems)}</div>
            <div className="text-xs text-muted-foreground">
              {((stats.lowStockItems / stats.totalProducts) * 100).toFixed(1)}% ของสินค้าทั้งหมด
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าหมด</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(stats.outOfStockItems)}</div>
            <div className="text-xs text-muted-foreground">
              ต้องสั่งซื้อด่วน
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats.monthlyGrowth}% จากเดือนที่แล้ว
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้จัดจำหน่าย</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalSuppliers)}</div>
            <div className="text-xs text-muted-foreground">
              ผู้จัดจำหน่ายที่ใช้งานอยู่
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">หมวดหมู่</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalCategories)}</div>
            <div className="text-xs text-muted-foreground">
              หมวดหมู่สินค้า
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ย</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageStockValue)}</div>
            <div className="text-xs text-muted-foreground">
              ต่อรายการสินค้า
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              หมวดหมู่สินค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatNumber(category.count)} รายการ</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(category.value)}</div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {category.percentage}% ของมูลค่ารวม
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              กิจกรรมล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{activity.product}</span>
                      <Badge variant={
                        activity.type === 'in' ? 'default' :
                        activity.type === 'out' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {activity.type === 'in' ? 'เข้า' : 
                         activity.type === 'out' ? 'ออก' : 'ปรับปรุง'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{activity.quantity > 0 ? '+' : ''}{activity.quantity} ชิ้น</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : activity.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            การดำเนินการด่วน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform">
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">เพิ่มสินค้า</span>
              <span className="text-xs text-muted-foreground">เพิ่มรายการใหม่</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm font-medium">จัดการสต็อก</span>
              <span className="text-xs text-muted-foreground">เข้า-ออกสินค้า</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">ดูรายงาน</span>
              <span className="text-xs text-muted-foreground">วิเคราะห์ข้อมูล</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">จัดการผู้ใช้</span>
              <span className="text-xs text-muted-foreground">สิทธิ์การเข้าถึง</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        อัปเดตล่าสุด: {lastUpdated.toLocaleString('th-TH')}
      </div>
    </div>
  );
}
