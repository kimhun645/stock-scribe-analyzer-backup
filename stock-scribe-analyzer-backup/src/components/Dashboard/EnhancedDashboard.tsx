import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShoppingCart,
  FileText,
  Shield,
  Zap,
  Target,
  Star,
  Calendar,
  Bell,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal
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
  topCategories: Array<{ name: string; count: number; value: number }>;
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
        topCategories: [
          { name: 'อิเล็กทรอนิกส์', count: 450, value: 1200000 },
          { name: 'เสื้อผ้า', count: 320, value: 800000 },
          { name: 'ของใช้ในบ้าน', count: 280, value: 500000 },
          { name: 'หนังสือ', count: 200, value: 300000 }
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
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
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
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    แดชบอร์ด
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100 text-lg">ระบบทำงานปกติ</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                สวัสดี <span className="font-semibold text-white">{user?.displayName || user?.email}</span>, 
                ยินดีต้อนรับสู่ระบบจัดการสต็อกอัจฉริยะ
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Calendar className="h-4 w-4 text-white" />
                  <span className="text-white text-sm">อัปเดตล่าสุด: {lastUpdated.toLocaleString('th-TH')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Activity className="h-4 w-4 text-green-300" />
                  <span className="text-white text-sm">ระบบออนไลน์</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white hover:text-white transition-all duration-300 group"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                  รีเฟรชข้อมูล
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent hover:bg-white/10 border-white/30 text-white hover:text-white backdrop-blur-sm transition-all duration-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  ตั้งค่า
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 border-blue-200 hover:shadow-2xl transition-all duration-500 card-entrance">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-800">สินค้าทั้งหมด</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-900 mb-1">{formatNumber(stats.totalProducts)}</div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <p className="text-sm text-blue-700">รายการสินค้าในระบบ</p>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-xs text-blue-600 font-medium">85%</span>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-50 border-amber-200 hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-amber-800">สินค้าใกล้หมด</CardTitle>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-amber-900 mb-1">{formatNumber(stats.lowStockItems)}</div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm text-amber-700">ต้องเติมสต็อก</p>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 bg-amber-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
              <span className="text-xs text-amber-600 font-medium">23%</span>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-100 to-pink-50 border-red-200 hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-red-800">สินค้าหมด</CardTitle>
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-red-900 mb-1">{formatNumber(stats.outOfStockItems)}</div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">ต้องสั่งซื้อด่วน</p>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 bg-red-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
              <span className="text-xs text-red-600 font-medium">5%</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Value Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 border-emerald-200 hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-emerald-800">มูลค่ารวม</CardTitle>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-emerald-900 mb-1">{formatCurrency(stats.totalValue)}</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-emerald-700">มูลค่าสต็อกทั้งหมด</p>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 bg-emerald-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-xs text-emerald-600 font-medium">92%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Categories Chart */}
        <Card className="xl:col-span-2 group hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-400">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">หมวดหมู่สินค้า</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white">
                <Eye className="h-4 w-4 mr-2" />
                ดูทั้งหมด
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {stats.topCategories.map((category, index) => (
                <div key={index} className="group/item">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                        index === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                        index === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                        'bg-gradient-to-r from-orange-500 to-amber-600'
                      }`}></div>
                      <span className="font-semibold text-gray-800">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{formatNumber(category.count)} รายการ</div>
                      <div className="text-sm text-gray-600">{formatCurrency(category.value)}</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                          index === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                          index === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                          'bg-gradient-to-r from-orange-500 to-amber-600'
                        }`}
                        style={{ 
                          width: `${(category.count / stats.topCategories[0].count) * 100}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="group hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">กิจกรรมล่าสุด</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group/item">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover/item:text-green-700 transition-colors">
                    มีการเคลื่อนไหวสต็อก {stats.recentMovements} รายการ
                  </p>
                  <p className="text-xs text-gray-500 mt-1">วันนี้ • 2 ชั่วโมงที่แล้ว</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">ใหม่</Badge>
              </div>

              <div className="flex items-start space-x-4 group/item">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover/item:text-amber-700 transition-colors">
                    รอการอนุมัติ {stats.pendingApprovals} รายการ
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ต้องดำเนินการ • 4 ชั่วโมงที่แล้ว</p>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">รอดำเนินการ</Badge>
              </div>

              <div className="flex items-start space-x-4 group/item">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover/item:text-blue-700 transition-colors">
                    เติบโต {stats.monthlyGrowth}% จากเดือนที่แล้ว
                  </p>
                  <p className="text-xs text-gray-500 mt-1">เปรียบเทียบ • 1 วันที่แล้ว</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">ดีขึ้น</Badge>
              </div>

              <div className="flex items-start space-x-4 group/item">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover/item:text-purple-700 transition-colors">
                    อัปเดตระบบเสร็จสิ้น
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ระบบ • 2 วันที่แล้ว</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">อัปเดต</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="group hover:shadow-2xl transition-all duration-500 card-entrance animate-delay-600">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">การดำเนินการด่วน</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <Plus className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">เพิ่มสินค้า</span>
            </Button>
            
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">ดูรายงาน</span>
            </Button>
            
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <Clock className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">การเคลื่อนไหว</span>
            </Button>
            
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">จัดการผู้ใช้</span>
            </Button>
            
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-rose-200 hover:border-rose-300 text-rose-700 hover:text-rose-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">สั่งซื้อ</span>
            </Button>
            
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border-teal-200 hover:border-teal-300 text-teal-700 hover:text-teal-800 shadow-md hover:shadow-lg transition-all duration-300 group">
              <FileText className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">รายงาน</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
