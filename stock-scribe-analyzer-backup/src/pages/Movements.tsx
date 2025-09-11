import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ArrowUp, ArrowDown, Package, Loader2, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, Movement } from '@/lib/apiService';
import { AddMovementDialog } from '@/components/Dialogs/AddMovementDialog';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScannerIndicator } from '@/components/ui/barcode-scanner-indicator';
import { MovementsHeader } from '@/components/Headers/MovementsHeader';

interface MovementWithProduct extends Movement {
  product_name: string;
  product_sku: string;
}

export default function Movements() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [movements, setMovements] = useState<MovementWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Barcode scanner support
  const { scannerDetected, lastScannedCode } = useBarcodeScanner({
    onScan: (scannedCode) => {
      // Auto-search for movement when barcode is scanned
      setSearchTerm(scannedCode);
      toast({
        title: "สแกนบาร์โค้ดสำเร็จ",
        description: `ค้นหาการเคลื่อนไหว: ${scannedCode}`,
      });
    },
    minLength: 3,
    timeout: 100
  });

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMovements();
      
      const movementsWithProduct = data?.map(movement => ({
        ...movement,
        product_name: movement.product_name || 'ไม่ระบุ',
        product_sku: movement.product_sku || 'ไม่ระบุ'
      })) || [];

      setMovements(movementsWithProduct);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการเคลื่อนไหวสต็อกได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.product_sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const todayMovements = movements.filter(m => 
    new Date(m.created_at).toDateString() === new Date().toDateString()
  );

  const todayStockIn = todayMovements.filter(m => m.type === 'in').length;
  const todayStockOut = todayMovements.filter(m => m.type === 'out').length;
  const totalMovements = movements.length;
  const totalValue = movements.reduce((sum, m) => {
    // Calculate approximate value based on movements (this is a simplified calculation)
    return sum + (m.quantity || 0) * 100; // Assuming average value of 100 per item
  }, 0);

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-6 pb-8 bg-transparent">
        {/* Professional Page Header */}
        <MovementsHeader
          todayStockIn={todayStockIn}
          todayStockOut={todayStockOut}
          totalMovements={totalMovements}
          totalValue={totalValue}
          onMovementAdded={fetchMovements}
        />

        {/* Enhanced Search */}
        <Card className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-200 shadow-2xl relative overflow-hidden card-entrance animate-delay-200">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200 rounded-full -translate-y-40 translate-x-40 blur-3xl pulse-emerald"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full translate-y-48 -translate-x-48 blur-3xl pulse-emerald delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-200 rounded-full -translate-x-32 -translate-y-32 blur-2xl pulse-emerald delay-500"></div>
          </div>
          
          {/* Geometric patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-6 right-6 w-3 h-3 bg-emerald-300 rounded-full float"></div>
            <div className="absolute top-16 right-16 w-2 h-2 bg-teal-300 rounded-full float-delay-1"></div>
            <div className="absolute top-24 right-24 w-4 h-4 bg-cyan-300 rounded-full float-delay-2"></div>
            <div className="absolute bottom-6 left-6 w-3 h-3 bg-emerald-300 rounded-full float"></div>
            <div className="absolute bottom-16 left-16 w-2 h-2 bg-teal-300 rounded-full float-delay-1"></div>
            <div className="absolute bottom-24 left-24 w-4 h-4 bg-cyan-300 rounded-full float-delay-2"></div>
          </div>
          
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="space-y-6">
              {/* Scanner Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl text-emerald-700 font-semibold">สถานะเครื่องสแกน:</span>
                  <BarcodeScannerIndicator isDetected={scannerDetected} />
                </div>
                {scannerDetected && (
                  <p className="text-base text-emerald-700 font-semibold bg-emerald-100 px-4 py-2 rounded-full border-2 border-emerald-300 shadow-sm transition-all duration-300 hover:scale-105">
                    ✨ พร้อมใช้งาน - สแกนบาร์โค้ดเพื่อค้นหาการเคลื่อนไหว
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 h-6 w-6" />
                  <Input
                    placeholder="ค้นหารายการเคลื่อนไหว ชื่อสินค้า SKU หรือเลขที่อ้างอิง..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg h-14 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 bg-transparent backdrop-blur-sm font-medium placeholder:text-emerald-600/70 transition-all duration-300 focus-ring"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-14 text-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-transparent backdrop-blur-sm font-medium transition-all duration-300 focus-ring">
                    <SelectValue placeholder="ประเภทรายการ" />
                  </SelectTrigger>
                  <SelectContent className="bg-transparent backdrop-blur-sm border-2 border-indigo-200">
                    <SelectItem value="all" className="text-lg font-medium py-3">ทุกประเภท</SelectItem>
                    <SelectItem value="in" className="text-lg font-medium py-3">รับเข้า</SelectItem>
                    <SelectItem value="out" className="text-lg font-medium py-3">เบิกออก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movements Table */}
        <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-2 border-slate-200 shadow-2xl relative overflow-hidden card-entrance animate-delay-400">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute top-0 right-0 w-80 h-80 bg-slate-200 rounded-full -translate-y-40 translate-x-40 blur-3xl pulse-blue"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full translate-y-48 -translate-x-48 blur-3xl pulse-blue delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-200 rounded-full -translate-x-32 -translate-y-32 blur-2xl pulse-blue delay-500"></div>
          </div>
          
          {/* Geometric patterns */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-6 right-6 w-3 h-3 bg-slate-300 rounded-full float"></div>
            <div className="absolute top-16 right-16 w-2 h-2 bg-blue-300 rounded-full float-delay-1"></div>
            <div className="absolute top-24 right-24 w-4 h-4 bg-indigo-300 rounded-full float-delay-2"></div>
            <div className="absolute bottom-6 left-6 w-3 h-3 bg-slate-300 rounded-full float"></div>
            <div className="absolute bottom-16 left-16 w-2 h-2 bg-blue-300 rounded-full float-delay-1"></div>
            <div className="absolute bottom-24 left-24 w-4 h-4 bg-indigo-300 rounded-full float-delay-2"></div>
          </div>
          
          <CardHeader className="pb-6 relative z-10 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-700 text-white rounded-t-lg -m-6 mb-6 p-6 shadow-lg">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
              <TrendingUp className="h-7 w-7 mr-3 text-blue-200" />
              รายการเคลื่อนไหวสต็อก
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-8 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-lg font-medium">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="overflow-x-auto bg-transparent backdrop-blur-sm rounded-lg border border-slate-100 shadow-inner">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-200">
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">วันที่</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">สินค้า</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden sm:table-cell text-slate-700">SKU</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">ประเภท</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">จำนวน</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden md:table-cell text-slate-700">เหตุผล</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden lg:table-cell text-slate-700">เลขที่อ้างอิง</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-lg font-medium bg-gray-50/50">
                          ไม่พบข้อมูลการเคลื่อนไหวสต็อกที่ตรงกับการค้นหา
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovements.map((movement, index) => (
                        <TableRow 
                          key={movement.id}
                          className={`hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/50 transition-all duration-300 card-entrance animate-delay-${(index % 5 + 1) * 100} ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-bold text-base sm:text-lg py-4">
                            <div className="flex flex-col">
                              <span>{new Date(movement.created_at).toLocaleDateString('th-TH')}</span>
                              <span className="text-xs text-muted-foreground sm:hidden">
                                {movement.product_sku}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-base sm:text-lg py-4">
                            <div className="max-w-[200px] truncate" title={movement.product_name}>
                              {movement.product_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-base sm:text-lg hidden sm:table-cell py-4">
                            {movement.product_sku}
                          </TableCell>
                          <TableCell className="text-base sm:text-lg py-4">
                            <Badge 
                              variant={movement.type === 'in' ? 'default' : 'secondary'}
                              className={`text-base font-bold px-4 py-2 ${movement.type === 'in' 
                                ? 'bg-green-500/10 text-green-600' 
                                : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              <div className="flex items-center">
                                {movement.type === 'in' ? (
                                  <ArrowUp className="mr-2 h-4 w-4" />
                                ) : (
                                  <ArrowDown className="mr-2 h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">
                                  {movement.type === 'in' ? 'รับเข้า' : 'เบิกออก'}
                                </span>
                                <span className="sm:hidden">
                                  {movement.type === 'in' ? '+' : '-'}
                                </span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-base sm:text-lg py-4">
                            <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                              {movement.type === 'in' ? '+' : '-'}{(movement.quantity || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-base sm:text-lg hidden md:table-cell py-4">
                            <div className="max-w-[150px] truncate" title={movement.reason}>
                              {movement.reason || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-base sm:text-lg hidden lg:table-cell py-4">
                            {movement.reference || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
