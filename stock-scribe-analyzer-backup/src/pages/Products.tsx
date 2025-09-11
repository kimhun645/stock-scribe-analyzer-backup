import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Package, BarChart3, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { api, type Product } from '@/lib/apiService';
import { AddProductDialog } from '@/components/Dialogs/AddProductDialog';
import { EditProductDialog } from '@/components/Dialogs/EditProductDialog';
import { useToast } from '@/hooks/use-toast';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScannerIndicator } from '@/components/ui/barcode-scanner-indicator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProductsHeader } from '@/components/Headers/ProductsHeader';

interface ProductWithCategory extends Product {
  categories?: { name: string };
  suppliers?: { name: string };
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);
  const { toast } = useToast();

  // Barcode scanner support
  const { scannerDetected, lastScannedCode } = useBarcodeScanner({
    onScan: (scannedCode) => {
      // Auto-search for product when barcode is scanned
      setSearchTerm(scannedCode);
      toast({
        title: "สแกนบาร์โค้ดสำเร็จ",
        description: `ค้นหาสินค้า: ${scannedCode}`,
      });
    },
    minLength: 3,
    timeout: 100
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = (product.current_stock || 0) <= (product.min_stock || 0);
    } else if (stockFilter === 'out') {
      matchesStock = (product.current_stock || 0) === 0;
    } else if (stockFilter === 'normal') {
      matchesStock = (product.current_stock || 0) > (product.min_stock || 0);
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const fetchProducts = async () => {
    try {
      const productsData = await api.getProducts();
      const categoriesData = await api.getCategories();

      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: ProductWithCategory) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await api.deleteProduct(productToDelete.id);

      toast({
        title: "สำเร็จ",
        description: `ลบสินค้า "${productToDelete.name}" สำเร็จแล้ว`,
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.current_stock || 0) <= (p.min_stock || 0)).length;
  const outOfStockProducts = products.filter(p => (p.current_stock || 0) === 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.current_stock || 0) * (p.unit_price || 0)), 0);

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-6 pb-8">
        {/* Professional Page Header */}
        <ProductsHeader
          totalProducts={totalProducts}
          lowStockProducts={lowStockProducts}
          outOfStockProducts={outOfStockProducts}
          totalValue={totalValue}
          onProductAdded={fetchProducts}
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
                    ✨ พร้อมใช้งาน - สแกนบาร์โค้ดเพื่อค้นหาสินค้า
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 h-6 w-6" />
                  <Input
                    placeholder="ค้นหาสินค้า ชื่อ SKU หรือคำอธิบาย..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg h-14 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 bg-white/90 backdrop-blur-sm font-medium placeholder:text-emerald-600/70 transition-all duration-300 focus-ring"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-14 text-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring">
                    <SelectValue placeholder="หมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-indigo-200">
                    <SelectItem value="all" className="text-lg font-medium py-3">ทุกหมวดหมู่</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="text-lg font-medium py-3">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-14 text-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring">
                    <SelectValue placeholder="สถานะสต็อก" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-orange-200">
                    <SelectItem value="all" className="text-lg font-medium py-3">ทุกสถานะ</SelectItem>
                    <SelectItem value="normal" className="text-lg font-medium py-3">สต็อกปกติ</SelectItem>
                    <SelectItem value="low" className="text-lg font-medium py-3">สต็อกต่ำ</SelectItem>
                    <SelectItem value="out" className="text-lg font-medium py-3">หมดสต็อก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
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
              <Package className="h-7 w-7 mr-3 text-blue-200" />
              รายการสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-8 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-lg font-medium">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white/70 backdrop-blur-sm rounded-lg border border-slate-100 shadow-inner">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-200">
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">สินค้า</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden sm:table-cell text-slate-700">SKU</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">หมวดหมู่</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">สต็อก</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden md:table-cell text-slate-700">ราคา</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 hidden lg:table-cell text-slate-700">สถานะ</TableHead>
                      <TableHead className="text-base sm:text-lg font-bold py-4 text-slate-700">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-lg font-medium bg-gray-50/50">
                          ไม่พบสินค้าที่ตรงกับการค้นหา
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <TableRow 
                          key={product.id} 
                          className={`hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/50 transition-all duration-300 card-entrance animate-delay-${(index % 5 + 1) * 100} ${
                            index % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-bold text-base sm:text-lg py-4">
                            <div className="max-w-[250px] truncate" title={product.name}>
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-base sm:text-lg hidden sm:table-cell py-4">
                            {product.sku}
                          </TableCell>
                          <TableCell className="text-base sm:text-lg py-4">
                            {product.categories?.name || 'ไม่ระบุ'}
                          </TableCell>
                          <TableCell className="text-base sm:text-lg font-bold py-4">
                            <span className={(product.current_stock || 0) <= (product.min_stock || 0) ? 'text-orange-600' : 'text-slate-700'}>
                              {(product.current_stock || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-base sm:text-lg font-bold py-4 hidden md:table-cell">
                            ฿{(product.unit_price || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-base sm:text-lg hidden lg:table-cell py-4">
                            <Badge 
                              variant={(product.current_stock || 0) > (product.min_stock || 0) ? 'default' : (product.current_stock || 0) > 0 ? 'secondary' : 'destructive'}
                              className={`text-base font-bold px-4 py-2 transition-all duration-300 ${
                                (product.current_stock || 0) > (product.min_stock || 0) 
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                                  : (product.current_stock || 0) > 0 
                                    ? 'bg-orange-500/10 text-orange-600 border-orange-200' 
                                    : 'bg-red-500/10 text-red-600 border-red-200'
                              }`}
                            >
                              {(product.current_stock || 0) > (product.min_stock || 0) ? 'ปกติ' : (product.current_stock || 0) > 0 ? 'ต่ำ' : 'หมด'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-3">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="h-12 w-12 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 btn-animate"
                              >
                                <Edit className="h-6 w-6" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive h-12 w-12 hover:bg-red-50 transition-all duration-200 btn-animate"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="h-6 w-6" />
                              </Button>
                            </div>
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

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProductUpdated={fetchProducts}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50 shadow-2xl border-2 border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-red-800">ยืนยันการลบสินค้า</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              คุณแน่ใจหรือไม่ที่จะลบสินค้า "{productToDelete?.name}"? 
              <br />
              <span className="text-destructive font-medium">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-red-200 hover:bg-red-50">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              ลบสินค้า
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}