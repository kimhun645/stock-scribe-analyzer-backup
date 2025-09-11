
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Package, DollarSign, AlertTriangle, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useStock } from '@/contexts/StockContext';
import { api } from '@/lib/apiService';
import { AdvancedAnalytics } from '@/components/Analytics/AdvancedAnalytics';

export default function Reports() {
  const { products, categories, movements } = useStock();
  const [reportType, setReportType] = useState('inventory');
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(false);

  const handleExportReport = () => {
    try {
      // Create report data based on current selection
      let reportData = [];
      let fileName = '';
      
      switch (reportType) {
        case 'inventory':
          fileName = `รายงานสต็อกสินค้า_${new Date().toISOString().split('T')[0]}.csv`;
          reportData = products.map(product => ({
            'SKU': product.sku,
            'ชื่อสินค้า': product.name,
            'หมวดหมู่': categories.find(c => c.id === product.category_id)?.name || 'ไม่ระบุ',
            'สต็อกปัจจุบัน': product.current_stock || 0,
            'สต็อกต่ำสุด': product.min_stock || 0,
            'ราคาต่อหน่วย': product.unit_price || 0,
            'มูลค่าสต็อก': (product.current_stock || 0) * (product.unit_price || 0),
            'สถานะ': (product.current_stock || 0) > (product.min_stock || 0) ? 'ปกติ' : 'สต็อกต่ำ'
          }));
          break;
          
        case 'sales':
          fileName = `รายงานการขาย_${new Date().toISOString().split('T')[0]}.csv`;
          reportData = salesData.map(day => ({
            'วัน': day.name,
            'ยอดขาย (มูลค่า)': day.sales.toFixed(2),
            'การซื้อ (มูลค่า)': day.purchases.toFixed(2),
            'กำไร (มูลค่า)': (day.sales - day.purchases).toFixed(2)
          }));
          break;
          
        case 'movements':
          fileName = `รายงานการเคลื่อนไหวสต็อก_${new Date().toISOString().split('T')[0]}.csv`;
          reportData = stockMovementData.map(week => ({
            'สัปดาห์': week.name,
            'รับเข้า (มูลค่า)': week.stockIn.toFixed(2),
            'เบิกออก (มูลค่า)': week.stockOut.toFixed(2),
            'คงเหลือ (มูลค่า)': (week.stockIn - week.stockOut).toFixed(2)
          }));
          break;
          
        case 'categories':
          fileName = `รายงานหมวดหมู่_${new Date().toISOString().split('T')[0]}.csv`;
          reportData = inventoryData.map(cat => ({
            'หมวดหมู่': cat.name,
            'จำนวนสินค้า': cat.value,
            'เปอร์เซ็นต์': ((cat.value / products.reduce((sum, p) => sum + p.current_stock, 0)) * 100).toFixed(2) + '%'
          }));
          break;
          
        default:
          fileName = `รายงาน_${new Date().toISOString().split('T')[0]}.csv`;
          reportData = [];
      }
      
      // Convert to CSV
      if (reportData.length > 0) {
        const headers = Object.keys(reportData[0]);
        const csvContent = [
          headers.join(','),
          ...reportData.map(row => 
            headers.map(header => {
              const value = row[header];
              // Handle values that contain commas or quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกรายงาน');
    }
  };

  // Generate real data for charts from actual database data
  const inventoryData = useMemo(() => {
    return categories.map(category => ({
      name: category.name,
      value: products.filter(p => p.category_id === category.id).reduce((sum, p) => sum + p.current_stock, 0)
    }));
  }, [categories, products]);

  // Generate real sales data based on actual stock movements
  const salesData = useMemo(() => {
    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    const today = new Date();
    
    return days.map((day, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (6 - index));
      
      const dayMovements = movements.filter(m => {
        const movementDate = new Date(m.created_at);
        return movementDate.toDateString() === dayDate.toDateString();
      });
      
      const sales = dayMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => {
          const product = products.find(p => p.id === m.product_id);
          return sum + (m.quantity * (product?.unit_price || 0));
        }, 0);
      
      const purchases = dayMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => {
          const product = products.find(p => p.id === m.product_id);
          return sum + (m.quantity * (product?.unit_price || 0));
        }, 0);
      
      return {
        name: day,
        sales: sales,
        purchases: purchases
      };
    });
  }, [movements, products]);

  // Generate real stock movement data from actual movements
  const stockMovementData = useMemo(() => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + 6));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekMovements = movements.filter(m => {
        const movementDate = new Date(m.created_at);
        return movementDate >= weekStart && movementDate <= weekEnd;
      });
      
      const stockIn = weekMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => {
          const product = products.find(p => p.id === m.product_id);
          return sum + (m.quantity * (product?.unit_price || 0));
        }, 0);
      
      const stockOut = weekMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => {
          const product = products.find(p => p.id === m.product_id);
          return sum + (m.quantity * (product?.unit_price || 0));
        }, 0);
      
      weeks.push({
        name: `สัปดาห์ ${4 - i}`,
        stockIn: stockIn,
        stockOut: stockOut
      });
    }
    
    return weeks;
  }, [movements, products]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Advanced Analytics */}
        <AdvancedAnalytics />
        
        {/* Legacy Reports - Keep for reference */}
        <div className="space-y-8">
          {/* Professional Page Header */}
          <PageHeader 
            title="รายงานและการวิเคราะห์ (แบบเดิม)"
            description="วิเคราะห์ข้อมูลเชิงลึกและติดตามประสิทธิภาพการจัดการสต็อก"
            icon={BarChart3}
            stats={[
              {
                label: "จำนวนสินค้าทั้งหมด",
                value: products.length.toString(),
                icon: Package
              },
              {
                label: "มูลค่าสต็อก",
                value: `฿${products.reduce((sum, p) => sum + ((p.unit_price || 0) * (p.current_stock || 0)), 0).toLocaleString()}`,
                icon: DollarSign
              },
              {
                label: "สินค้าสต็อกต่ำ",
                value: products.filter(p => (p.current_stock || 0) <= (p.min_stock || 0)).length.toString(),
                icon: AlertTriangle
              },
              {
                label: "หมวดหมู่",
                value: categories.length.toString(),
                icon: FolderOpen
              }
            ]}
          />

        {/* Filters and Actions */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ประเภทรายงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">รายงานสต็อกสินค้า</SelectItem>
                  <SelectItem value="sales">รายงานการขาย</SelectItem>
                  <SelectItem value="movements">การเคลื่อนไหวสต็อก</SelectItem>
                  <SelectItem value="categories">การวิเคราะห์หมวดหมู่</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="90days">3 เดือนที่ผ่านมา</SelectItem>
                  <SelectItem value="1year">1 ปีที่ผ่านมา</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  รีเฟรชข้อมูล
                </Button>
                
                <Button 
                  onClick={handleExportReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  ส่งออกรายงาน
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Charts */}
        <div className="w-full min-h-0">
          {reportType === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">สต็อกแยกตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryData.some(cat => cat.value > 0) ? (
                    <>
                      <div className="w-full h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {inventoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setReportType('categories');
                            handleExportReport();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          ส่งออกรายงานหมวดหมู่
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">ไม่มีข้อมูลสต็อก</h3>
                      <p className="text-muted-foreground">ยังไม่มีสินค้าในระบบ</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">ระดับสต็อก</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryData.some(cat => cat.value > 0) ? (
                    <div className="w-full h-[250px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">ไม่มีข้อมูลสต็อก</h3>
                      <p className="text-muted-foreground">ยังไม่มีสินค้าในระบบ</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'sales' && (
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">ยอดขาย vs การซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.some(day => day.sales > 0 || day.purchases > 0) ? (
                  <>
                    <div className="w-full h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [`฿${value.toFixed(2)}`, '']} />
                          <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="ยอดขาย" />
                          <Line type="monotone" dataKey="purchases" stroke="#82ca9d" strokeWidth={2} name="การซื้อ" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setReportType('sales');
                          handleExportReport();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        ส่งออกรายงานการขาย
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ไม่มีข้อมูลการขาย</h3>
                    <p className="text-muted-foreground">ยังไม่มีการเคลื่อนไหวสต็อกใน 7 วันที่ผ่านมา</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {reportType === 'movements' && (
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">รับเข้า vs เบิกออก</CardTitle>
              </CardHeader>
              <CardContent>
                {stockMovementData.some(week => week.stockIn > 0 || week.stockOut > 0) ? (
                  <>
                    <div className="w-full h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockMovementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [`฿${value.toFixed(2)}`, '']} />
                          <Bar dataKey="stockIn" fill="#82ca9d" name="รับเข้า" />
                          <Bar dataKey="stockOut" fill="#ff7300" name="เบิกออก" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setReportType('movements');
                          handleExportReport();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        ส่งออกรายงานการเคลื่อนไหว
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ไม่มีข้อมูลการเคลื่อนไหว</h3>
                    <p className="text-muted-foreground">ยังไม่มีการเคลื่อนไหวสต็อกใน 4 สัปดาห์ที่ผ่านมา</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
}
