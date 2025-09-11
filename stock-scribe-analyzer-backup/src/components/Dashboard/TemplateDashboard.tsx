import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileInvoice,
  MoneyBillWave,
  ExclamationTriangle,
  ClipboardCheck,
  Plus,
  SyncAlt,
  ExclamationCircle,
  TimesCircle,
  Cubes,
  ArrowUp,
  ArrowDown,
  Search,
  Bell,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';

interface TemplateStats {
  totalBills: number;
  totalValue: number;
  lowStockAlerts: number;
  pendingApprovals: number;
  recentActivities: Array<{
    id: string;
    type: 'add' | 'update' | 'alert';
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'info';
  }>;
  stockOverview: {
    lowStock: number;
    outOfStock: number;
    totalItems: number;
    warehouseUsage: number;
  };
  categoryDistribution: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
}

export function TemplateDashboard() {
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { getStockLevel } = useStock();
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockStats: TemplateStats = {
        totalBills: 24,
        totalValue: 80240,
        lowStockAlerts: 3,
        pendingApprovals: 5,
        recentActivities: [
          {
            id: '1',
            type: 'add',
            title: 'เพิ่มสินค้าใหม่',
            description: 'สินค้า: ครีมนวดผม\nจำนวน: 10 หมวดหมู่: สินค้าอุปโภค',
            time: '13:25 วันนี้',
            status: 'success'
          },
          {
            id: '2',
            type: 'update',
            title: 'อัพเดทสต็อก',
            description: 'สินค้า: แชมพูสมุนไพร\nจำนวน: +25 สถานะ: เพิ่มสต็อก',
            time: '10:45 วันนี้',
            status: 'info'
          }
        ],
        stockOverview: {
          lowStock: 3,
          outOfStock: 1,
          totalItems: 42,
          warehouseUsage: 65
        },
        categoryDistribution: [
          { name: 'สินค้าอุปโภค', percentage: 45, color: 'purple' },
          { name: 'สินค้าบริโภค', percentage: 30, color: 'pink' },
          { name: 'วัสดุสิ้นเปลือง', percentage: 25, color: 'teal' }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">กำลังโหลดข้อมูล...</p>
            <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Test Header */}
      <div className="bg-red-500 text-white p-4 text-center font-bold text-xl">
        TEMPLATE DASHBOARD LOADED SUCCESSFULLY!
      </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              แดชบอร์ด Template
            </h1>
            <p className="text-gray-500 mt-1">ภาพรวมระบบบริหารจัดการสต็อกสินค้าทั้งหมด</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="outline" size="sm" className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
              <Bell className="h-5 w-5 text-purple-500" />
            </Button>
            <Button variant="outline" size="sm" className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
              <Settings className="h-5 w-5 text-purple-500" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 - Total Bills */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FileInvoice className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">บิลทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalBills)}</p>
            </div>
            <div className="text-sm font-semibold text-green-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" />
              12%
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Total Value */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-cyan-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <MoneyBillWave className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">มูลค่าทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="text-sm font-semibold text-red-500 flex items-center">
              <ArrowDown className="h-4 w-4 mr-1" />
              8%
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Low Stock Alerts */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ExclamationTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">แจ้งเตือนสินค้า</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.lowStockAlerts)}</p>
            </div>
            <div className="text-sm font-semibold text-gray-500">0%</div>
          </CardContent>
        </Card>

        {/* Card 4 - Pending Approvals */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-3 bg-cyan-100 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">การอนุมัติ</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingApprovals)}</p>
            </div>
            <div className="text-sm font-semibold text-green-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" />
              100%
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">กิจกรรมล่าสุด</CardTitle>
            <p className="text-sm text-gray-500">การเคลื่อนไหวล่าสุดในระบบของคุณ</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  activity.status === 'success' ? 'bg-green-50 border-green-200' :
                  activity.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.status === 'success' ? 'bg-green-200 text-green-700' :
                  activity.status === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                  'bg-blue-200 text-blue-700'
                }`}>
                  {activity.type === 'add' ? <Plus className="h-5 w-5" /> : <SyncAlt className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`text-xs font-semibold ${
                    activity.status === 'success' ? 'text-green-600 border-green-200 hover:bg-green-50' :
                    activity.status === 'warning' ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' :
                    'text-blue-600 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  ดูรายละเอียด
                </Button>
              </div>
            ))}
            
            <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
              ดูประวัติการเคลื่อนไหว <ArrowRight className="h-4 w-4 ml-2 inline" />
            </Button>
          </CardContent>
        </Card>

        {/* Stock Overview */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">ภาพรวมสต็อกสินค้า</CardTitle>
            <p className="text-sm text-gray-500">สินค้าในคลังทั้งหมด</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-3 rounded-xl bg-orange-50">
              <div className="w-10 h-10 rounded-lg bg-orange-200 text-orange-700 flex items-center justify-center flex-shrink-0 mr-3">
                <ExclamationCircle className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm text-gray-900">สินค้าใกล้หมด</span>
              <Badge className="ml-auto bg-white border border-orange-200 text-orange-600">
                {stats.stockOverview.lowStock}
              </Badge>
            </div>
            
            <div className="flex items-center p-3 rounded-xl bg-red-50">
              <div className="w-10 h-10 rounded-lg bg-red-200 text-red-700 flex items-center justify-center flex-shrink-0 mr-3">
                <TimesCircle className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm text-gray-900">สินค้าไม่มีในสต็อก</span>
              <Badge className="ml-auto bg-white border border-red-200 text-red-600">
                {stats.stockOverview.outOfStock}
              </Badge>
            </div>
            
            <div className="flex items-center p-3 rounded-xl bg-teal-50">
              <div className="w-10 h-10 rounded-lg bg-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 mr-3">
                <Cubes className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm text-gray-900">สินค้าทั้งหมดในสต็อก</span>
              <Badge className="ml-auto bg-white border border-teal-200 text-teal-600">
                {stats.stockOverview.totalItems}
              </Badge>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">พื้นที่ใช้งานในคลัง</span>
                <span className="text-sm font-bold text-purple-600">{stats.stockOverview.warehouseUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.stockOverview.warehouseUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Second Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Distribution */}
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">การกระจายหมวดหมู่</CardTitle>
            <p className="text-sm text-gray-500">สัดส่วนสินค้าในแต่ละหมวดหมู่</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center my-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-gray-900">{stats.stockOverview.totalItems}</span>
                      <span className="text-xs text-gray-500">สินค้า</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-4 border-purple-500 border-t-transparent border-r-transparent transform rotate-45"></div>
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-4 border-pink-500 border-b-transparent border-l-transparent transform rotate-45" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 50% 0)' }}></div>
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-4 border-teal-500 border-t-transparent border-l-transparent transform rotate-45" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 50% 100%)' }}></div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              {stats.categoryDistribution.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      category.color === 'purple' ? 'bg-purple-500' :
                      category.color === 'pink' ? 'bg-pink-500' :
                      'bg-teal-500'
                    }`}></span>
                    <span className="text-gray-900">{category.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Movement Chart */}
        <Card className="lg:col-span-2 group relative overflow-hidden bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">กราฟการณ์เคลื่อนไหว</CardTitle>
                <p className="text-sm text-gray-500">แสดงการเคลื่อนไหวล่าสุดใน 30 วันที่ผ่านมา</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="px-3 py-1.5 text-sm rounded-xl bg-purple-100 text-purple-600 font-medium">
                  วัน
                </Button>
                <Button variant="outline" size="sm" className="px-3 py-1.5 text-sm rounded-xl">
                  สัปดาห์
                </Button>
                <Button variant="outline" size="sm" className="px-3 py-1.5 text-sm rounded-xl">
                  เดือน
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 h-64 w-full bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">กราฟการเคลื่อนไหว</p>
                <p className="text-sm text-gray-500">ข้อมูลจะแสดงที่นี่</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            อัปเดตล่าสุด: {lastUpdated.toLocaleString('th-TH')}
          </span>
        </div>
      </div>
    </div>
  );
}
