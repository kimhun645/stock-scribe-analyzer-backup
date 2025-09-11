import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Package, BarChart3, TrendingUp, AlertTriangle, Eye, ChevronLeft, ChevronRight, ArrowUpDown, Filter, X, RefreshCw, Download, Upload, Grid3X3, List, CheckSquare, Square, MoreVertical, Copy, Star, Heart } from 'lucide-react';
import { api, type Product } from '@/lib/apiService';
import { AddProductDialog } from '@/components/Dialogs/AddProductDialog';
import { EditProductDialog } from '@/components/Dialogs/EditProductDialog';
import { useToast } from '@/hooks/use-toast';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScannerIndicator } from '@/components/ui/barcode-scanner-indicator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlobalSearch } from '@/components/Search/GlobalSearch';

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
  
  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof ProductWithCategory>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
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

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
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
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field: keyof ProductWithCategory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      for (const productId of selectedProducts) {
        await api.deleteProduct(productId);
      }
      
      toast({
        title: "สำเร็จ",
        description: `ลบสินค้า ${selectedProducts.length} รายการสำเร็จแล้ว`,
      });
      
      fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        variant: "destructive",
      });
    }
  };

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
      <div className="min-h-screen">
      <div className="w-full space-y-6 pb-8">
          {/* Dashboard-Style Header */}
          <header className="relative overflow-hidden mb-4 -mx-4 sm:-mx-6 lg:-mx-8 rounded-2xl shadow-xl">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
            {/* Main Header Content */}
            <div className="relative z-10 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Left Side - Title and Description */}
                <div className="flex-1">
                  <h1 className="relative text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-2xl">
                    <span className="relative z-10">สินค้า</span>
                    <div className="absolute inset-0 text-white/20 blur-sm transform translate-x-1 translate-y-1">
                      สินค้า
                    </div>
                  </h1>
                  <p className="relative text-white/90 text-base lg:text-lg font-medium drop-shadow-lg">
                    <span className="relative z-10">จัดการสินค้าและสต็อกอย่างครบถ้วน พร้อมระบบติดตามและแจ้งเตือนอัตโนมัติ</span>
                    <div className="absolute inset-0 text-white/20 blur-sm transform translate-x-0.5 translate-y-0.5">
                      จัดการสินค้าและสต็อกอย่างครบถ้วน พร้อมระบบติดตามและแจ้งเตือนอัตโนมัติ
                    </div>
                  </p>
          </div>
          
                 {/* Right Side - Search and Action Button */}
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                   {/* Global Search */}
                   <div className="flex-1 min-w-0">
                     <GlobalSearch 
                       className="w-full max-w-lg" 
                       placeholder="ค้นหาสินค้า ชื่อ SKU หรือคำอธิบาย..."
                       showFilters={true}
                       value={searchTerm}
                       onChange={setSearchTerm}
                     />
          </div>
          
              
                   {/* Action Buttons */}
                   <div className="flex items-center gap-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={fetchProducts}
                       className="group relative p-3 rounded-full bg-gradient-to-br from-green-500/40 via-emerald-500/30 to-teal-500/40 backdrop-blur-sm border-green-400/50 hover:from-green-500/60 hover:via-emerald-500/50 hover:to-teal-500/60 text-white hover:text-white transition-all duration-300 shadow-2xl hover:shadow-green-500/40 hover:scale-110 transform"
                     >
                       <RefreshCw className="h-4 w-4" />
                     </Button>
                     
                     <AddProductDialog onProductAdded={fetchProducts} />
                   </div>
                 </div>
          </div>
          
              {/* Bottom Decorative Line */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-white/70 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-300 rounded-full blur-sm animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-200 rounded-full blur-md animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                      <span className="font-medium text-green-100">ระบบออนไลน์</span>
                    </div>
                    <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    <span>อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}</span>
                  </div>
                   <div className="hidden sm:flex items-center gap-4">
              {/* Scanner Status */}
                     <div className="flex items-center gap-2">
                  <BarcodeScannerIndicator isDetected={scannerDetected} />
                {scannerDetected && (
                         <span className="text-xs text-green-100 bg-green-500/20 px-2 py-1 rounded-full">
                           สแกนพร้อม
                         </span>
                )}
              </div>
              
                     <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                     
                     <span className="font-medium text-blue-100">พร้อมใช้งาน</span>
                     <div className="relative">
                       <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full shadow-lg shadow-blue-400/50"></div>
                       <div className="absolute inset-0 w-3 h-3 bg-blue-300 rounded-full blur-sm"></div>
                       <div className="absolute inset-0 w-3 h-3 bg-blue-200 rounded-full blur-md"></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Cards Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 - Total Products */}
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-indigo-400/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className="relative p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <Package className="relative h-6 w-6 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">สินค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">{totalProducts}</p>
                </div>
                <div className="text-sm font-semibold text-green-500 flex items-center bg-green-50 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {totalProducts > 0 ? '100%' : '0%'}
                </div>
              </CardContent>
            </Card>

            {/* Card 2 - Low Stock Alerts */}
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/30 to-amber-400/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className={`relative p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg ${lowStockProducts > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30' : 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/30'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <AlertTriangle className="relative h-6 w-6 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">สต็อกต่ำ</p>
                  <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">{lowStockProducts}</p>
                </div>
                <div className="text-sm font-semibold text-orange-500 flex items-center bg-orange-50 px-3 py-1 rounded-full">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {totalProducts > 0 ? Math.round((lowStockProducts / totalProducts) * 100) : 0}%
                </div>
              </CardContent>
            </Card>

            {/* Card 3 - Out of Stock */}
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-300/20 to-pink-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className={`relative p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg ${outOfStockProducts > 0 ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/30' : 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/30'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <TrendingUp className="relative h-6 w-6 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">หมดสต็อก</p>
                  <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">{outOfStockProducts}</p>
                </div>
                <div className="text-sm font-semibold text-red-500 flex items-center bg-red-50 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {totalProducts > 0 ? Math.round((outOfStockProducts / totalProducts) * 100) : 0}%
                </div>
              </CardContent>
            </Card>

            {/* Card 4 - Total Value */}
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className="relative p-4 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg shadow-teal-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <BarChart3 className="relative h-6 w-6 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">มูลค่ารวม</p>
                  <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">฿{totalValue.toLocaleString()}</p>
                </div>
                <div className="text-sm font-semibold text-green-500 flex items-center bg-green-50 px-3 py-1 rounded-full">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {totalValue > 0 ? '100%' : '0%'}
                </div>
              </CardContent>
            </Card>
          </section>


          {/* Bulk Actions Bar */}
          {selectedProducts.length > 0 && (
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-1 transform mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-orange-600" />
                      <span className="text-lg font-semibold text-gray-700">
                        เลือกแล้ว {selectedProducts.length} รายการ
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                      className="h-8 px-3 rounded-xl border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <X className="h-4 w-4 mr-1" />
                      ยกเลิก
                    </Button>
          </div>
          
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-xl border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      คัดลอก
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-xl border-green-200 hover:bg-green-50 hover:border-green-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      ส่งออก
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="h-8 px-3 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      ลบทั้งหมด
                    </Button>
                  </div>
          </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table - Dashboard Theme */}
          {viewMode === 'table' && (
            <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 transform">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
            
            <CardHeader className="pb-6 relative z-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white rounded-t-2xl -m-6 mb-6 p-8 shadow-lg">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                {/* Left Side - Title and Stats */}
                <div className="flex-1 space-y-4">
                  <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
                    <div className="relative p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                      <Package className="h-7 w-7 text-purple-200" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    </div>
                    <div>
                      <div className="relative">
                        <span className="relative z-10">รายการสินค้า</span>
                        <div className="absolute inset-0 text-white/20 blur-sm transform translate-x-1 translate-y-1">
                          รายการสินค้า
                        </div>
                      </div>
                      <p className="text-sm text-white/80 font-medium mt-1">
                        จัดการสินค้าอย่างครบถ้วน พร้อมระบบติดตามสต็อก
                      </p>
                    </div>
                  </CardTitle>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-white/90">
                        {filteredProducts.length} รายการ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-white/90">
                        หน้า {currentPage} จาก {totalPages}
                      </span>
                    </div>
                    {selectedProducts.length > 0 && (
                      <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-orange-400/30">
                        <CheckSquare className="w-4 h-4 text-orange-200" />
                        <span className="text-sm font-medium text-orange-100">
                          เลือก {selectedProducts.length} รายการ
                        </span>
                      </div>
                    )}
                  </div>
              </div>
              
                {/* Right Side - Quick Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl p-1 border border-white/30">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={`h-9 px-4 rounded-xl transition-all duration-300 ${
                        viewMode === 'table' 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <List className="h-4 w-4 mr-2" />
                      ตาราง
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`h-9 px-4 rounded-xl transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      กริด
                    </Button>
                </div>
                
                  {/* Sort Info */}
                  <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                    <ArrowUpDown className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/80">
                      เรียงตาม: {sortField === 'name' ? 'ชื่อ' : sortField === 'sku' ? 'SKU' : sortField === 'current_stock' ? 'สต็อก' : 'ราคา'}
                    </span>
                    <span className="text-xs text-white/60">
                      ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                    </span>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                      disabled={selectedProducts.length === 0}
                      className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-1" />
                      ล้าง
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchProducts}
                      className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      รีเฟรช
                    </Button>
                    
                     <Dialog open={showFilters} onOpenChange={setShowFilters}>
                       <DialogTrigger asChild>
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                         >
                           <Filter className="w-4 h-4 mr-1" />
                           กรอง
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-lg border-0 rounded-2xl shadow-2xl">
                         <DialogHeader>
                           <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                             <Filter className="h-5 w-5 text-purple-600" />
                             ตัวกรองสินค้า
                           </DialogTitle>
                           <DialogDescription className="text-gray-600">
                             เลือกตัวกรองเพื่อค้นหาสินค้าตามที่ต้องการ
                           </DialogDescription>
                         </DialogHeader>
                         
                         <div className="space-y-6 py-4">
                           {/* Category Filter */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">หมวดหมู่</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl">
                                 <SelectItem value="all" className="text-base font-medium py-3">ทุกหมวดหมู่</SelectItem>
                    {categories.map(category => (
                                   <SelectItem key={category.id} value={category.id} className="text-base font-medium py-3">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                           </div>
                
                           {/* Stock Filter */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">สถานะสต็อก</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-2xl">
                                 <SelectItem value="all" className="text-base font-medium py-3">ทุกสถานะ</SelectItem>
                                 <SelectItem value="normal" className="text-base font-medium py-3">สต็อกปกติ</SelectItem>
                                 <SelectItem value="low" className="text-base font-medium py-3">สต็อกต่ำ</SelectItem>
                                 <SelectItem value="out" className="text-base font-medium py-3">หมดสต็อก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                           
                           {/* Items Per Page */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">แสดงต่อหน้า</label>
                             <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="จำนวนรายการ" />
                               </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl">
                                 <SelectItem value="5" className="text-base font-medium py-3">5 รายการ</SelectItem>
                                 <SelectItem value="10" className="text-base font-medium py-3">10 รายการ</SelectItem>
                                 <SelectItem value="25" className="text-base font-medium py-3">25 รายการ</SelectItem>
                                 <SelectItem value="50" className="text-base font-medium py-3">50 รายการ</SelectItem>
                                 <SelectItem value="100" className="text-base font-medium py-3">100 รายการ</SelectItem>
                               </SelectContent>
                             </Select>
          </div>
          
                           {/* Results Summary */}
                           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                             <div className="flex items-center justify-between text-sm">
                               <span className="font-medium text-gray-700">ผลลัพธ์:</span>
                               <span className="font-bold text-purple-600">{filteredProducts.length} รายการ</span>
                             </div>
                             <div className="flex items-center justify-between text-sm mt-1">
                               <span className="text-gray-600">หน้า:</span>
                               <span className="font-medium text-gray-800">{currentPage} จาก {totalPages}</span>
                             </div>
                           </div>
          </div>
          
                         <div className="flex justify-end gap-3 pt-4">
                           <Button
                             variant="outline"
                             onClick={() => setShowFilters(false)}
                             className="px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300"
                           >
                             ปิด
                           </Button>
                           <Button
                             onClick={() => {
                               setCategoryFilter('all');
                               setStockFilter('all');
                               setItemsPerPage(10);
                               setCurrentPage(1);
                             }}
                             className="px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                           >
                             รีเซ็ต
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                  </div>
                </div>
              </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-8 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-lg font-medium">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-inner">
                <Table>
                  <TableHeader>
                     <TableRow className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 transition-all duration-300 border-b-2 border-purple-200">
                       <TableHead className="w-12 py-4 pl-6">
                         <div className="flex items-center justify-center">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={handleSelectAll}
                             className="h-7 w-7 p-0 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:scale-110"
                           >
                             {selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                               <CheckSquare className="h-4 w-4 text-purple-600" />
                             ) : (
                               <Square className="h-4 w-4 text-purple-600" />
                             )}
                           </Button>
                         </div>
                       </TableHead>
                       <TableHead 
                         className="text-base sm:text-lg font-bold py-4 text-purple-700 cursor-pointer hover:bg-purple-100/50 transition-all duration-200 hover:scale-105 group"
                         onClick={() => handleSort('name')}
                       >
                         <div className="flex items-center gap-2 group-hover:text-purple-800">
                           <Package className="h-4 w-4 text-purple-500" />
                           <span>สินค้า</span>
                           <ArrowUpDown className="h-4 w-4 group-hover:text-purple-600 transition-colors duration-200" />
                         </div>
                       </TableHead>
                       <TableHead 
                         className="text-base sm:text-lg font-bold py-4 hidden sm:table-cell text-purple-700 cursor-pointer hover:bg-purple-100/50 transition-all duration-200 hover:scale-105 group"
                         onClick={() => handleSort('sku')}
                       >
                         <div className="flex items-center gap-2 group-hover:text-purple-800">
                           <span className="font-mono text-sm">SKU</span>
                           <ArrowUpDown className="h-4 w-4 group-hover:text-purple-600 transition-colors duration-200" />
                         </div>
                       </TableHead>
                       <TableHead className="text-base sm:text-lg font-bold py-4 text-purple-700">
                         <div className="flex items-center gap-2">
                           <Filter className="h-4 w-4 text-purple-500" />
                           <span>หมวดหมู่</span>
                         </div>
                       </TableHead>
                       <TableHead 
                         className="text-base sm:text-lg font-bold py-4 text-purple-700 cursor-pointer hover:bg-purple-100/50 transition-all duration-200 hover:scale-105 group"
                         onClick={() => handleSort('current_stock')}
                       >
                         <div className="flex items-center gap-2 group-hover:text-purple-800">
                           <BarChart3 className="h-4 w-4 text-purple-500" />
                           <span>สต็อก</span>
                           <ArrowUpDown className="h-4 w-4 group-hover:text-purple-600 transition-colors duration-200" />
                         </div>
                       </TableHead>
                       <TableHead 
                         className="text-base sm:text-lg font-bold py-4 hidden md:table-cell text-purple-700 cursor-pointer hover:bg-purple-100/50 transition-all duration-200 hover:scale-105 group"
                         onClick={() => handleSort('unit_price')}
                       >
                         <div className="flex items-center gap-2 group-hover:text-purple-800">
                           <span className="text-green-600">฿</span>
                           <span>ราคา</span>
                           <ArrowUpDown className="h-4 w-4 group-hover:text-purple-600 transition-colors duration-200" />
                         </div>
                       </TableHead>
                       <TableHead className="text-base sm:text-lg font-bold py-4 hidden lg:table-cell text-purple-700">
                         <div className="flex items-center gap-2">
                           <AlertTriangle className="h-4 w-4 text-purple-500" />
                           <span>สถานะ</span>
                         </div>
                       </TableHead>
                       <TableHead className="text-base sm:text-lg font-bold py-4 text-purple-700 pr-6">
                         <div className="flex items-center gap-2">
                           <MoreVertical className="h-4 w-4 text-purple-500" />
                           <span>การจัดการ</span>
                         </div>
                       </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-lg font-medium bg-gray-50/50">
                          ไม่พบสินค้าที่ตรงกับการค้นหา
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product, index) => (
                        <TableRow 
                          key={product.id} 
                          className={`hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300 card-entrance animate-delay-${(index % 5 + 1) * 100} ${
                            index % 2 === 0 ? 'bg-white/60' : 'bg-purple-50/30'
                          } ${selectedProducts.includes(product.id) ? 'bg-purple-100/50 ring-1 ring-purple-300' : ''} group`}
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectProduct(product.id)}
                                className="h-7 w-7 p-0 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:scale-110"
                              >
                                {selectedProducts.includes(product.id) ? (
                                  <CheckSquare className="h-4 w-4 text-purple-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-purple-600" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
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
                          <TableCell className="py-4 pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="group relative h-10 w-10 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 hover:scale-110 transform rounded-xl border border-transparent hover:border-purple-200"
                                title="แก้ไขสินค้า"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Edit className="relative h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="group relative text-destructive hover:text-destructive h-10 w-10 hover:bg-red-50 transition-all duration-300 hover:scale-110 transform rounded-xl border border-transparent hover:border-red-200"
                                onClick={() => handleDeleteProduct(product)}
                                title="ลบสินค้า"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Trash2 className="relative h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="group relative h-10 w-10 hover:bg-gray-50 hover:text-gray-600 transition-all duration-300 hover:scale-110 transform rounded-xl border border-transparent hover:border-gray-200"
                                title="ตัวเลือกเพิ่มเติม"
                              >
                                <MoreVertical className="relative h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
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
         )}

         {/* Grid View */}
         {viewMode === 'grid' && (
           <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 transform">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <CardHeader className="pb-6 relative z-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white rounded-t-2xl -m-6 mb-6 p-8 shadow-lg">
               <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                 {/* Left Side - Title and Stats */}
                 <div className="flex-1 space-y-4">
                   <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
                     <div className="relative p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                       <Grid3X3 className="h-7 w-7 text-purple-200" />
                       <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                     </div>
                     <div>
                       <div className="relative">
                         <span className="relative z-10">มุมมองกริด</span>
                         <div className="absolute inset-0 text-white/20 blur-sm transform translate-x-1 translate-y-1">
                           มุมมองกริด
                         </div>
                       </div>
                       <p className="text-sm text-white/80 font-medium mt-1">
                         ดูสินค้าในรูปแบบการ์ดที่สวยงามและใช้งานง่าย
                       </p>
                     </div>
                   </CardTitle>
                   
                   {/* Quick Stats */}
                   <div className="flex flex-wrap items-center gap-3">
                     <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                       <span className="text-sm font-medium text-white/90">
                         {filteredProducts.length} รายการ
                       </span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                       <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                       <span className="text-sm font-medium text-white/90">
                         แสดงทั้งหมด
                       </span>
                     </div>
                     {selectedProducts.length > 0 && (
                       <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-orange-400/30">
                         <CheckSquare className="w-4 h-4 text-orange-200" />
                         <span className="text-sm font-medium text-orange-100">
                           เลือก {selectedProducts.length} รายการ
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
                 
                 {/* Right Side - Quick Actions */}
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                   {/* View Toggle */}
                   <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl p-1 border border-white/30">
                     <Button
                       variant={viewMode === 'table' ? 'default' : 'ghost'}
                       size="sm"
                       onClick={() => setViewMode('table')}
                       className={`h-9 px-4 rounded-xl transition-all duration-300 ${
                         viewMode === 'table' 
                           ? 'bg-white text-purple-600 shadow-lg' 
                           : 'text-white hover:bg-white/20'
                       }`}
                     >
                       <List className="h-4 w-4 mr-2" />
                       ตาราง
                     </Button>
                     <Button
                       variant={viewMode === 'grid' ? 'default' : 'ghost'}
                       size="sm"
                       onClick={() => setViewMode('grid')}
                       className={`h-9 px-4 rounded-xl transition-all duration-300 ${
                         viewMode === 'grid' 
                           ? 'bg-white text-purple-600 shadow-lg' 
                           : 'text-white hover:bg-white/20'
                       }`}
                     >
                       <Grid3X3 className="h-4 w-4 mr-2" />
                       กริด
                     </Button>
                   </div>
                   
                   {/* View Info */}
                   <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                     <Grid3X3 className="w-4 h-4 text-white/70" />
                     <span className="text-sm text-white/80">
                       มุมมองการ์ด
                     </span>
                     <span className="text-xs text-white/60">
                       ({paginatedProducts.length} รายการ)
                     </span>
                   </div>
                   
                   {/* Quick Action Buttons */}
                   <div className="flex items-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setSelectedProducts([])}
                       disabled={selectedProducts.length === 0}
                       className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <X className="w-4 h-4 mr-1" />
                       ล้าง
                     </Button>
                     
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={fetchProducts}
                       className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                     >
                       <RefreshCw className="w-4 h-4 mr-1" />
                       รีเฟรช
                     </Button>
                     
                     <Dialog open={showFilters} onOpenChange={setShowFilters}>
                       <DialogTrigger asChild>
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-9 px-3 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                         >
                           <Filter className="w-4 h-4 mr-1" />
                           กรอง
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-lg border-0 rounded-2xl shadow-2xl">
                         <DialogHeader>
                           <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                             <Filter className="h-5 w-5 text-purple-600" />
                             ตัวกรองสินค้า
                           </DialogTitle>
                           <DialogDescription className="text-gray-600">
                             เลือกตัวกรองเพื่อค้นหาสินค้าตามที่ต้องการ
                           </DialogDescription>
                         </DialogHeader>
                         
                         <div className="space-y-6 py-4">
                           {/* Category Filter */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">หมวดหมู่</label>
                             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="เลือกหมวดหมู่" />
                               </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl">
                                 <SelectItem value="all" className="text-base font-medium py-3">ทุกหมวดหมู่</SelectItem>
                                 {categories.map(category => (
                                   <SelectItem key={category.id} value={category.id} className="text-base font-medium py-3">
                                     {category.name}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                           
                           {/* Stock Filter */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">สถานะสต็อก</label>
                             <Select value={stockFilter} onValueChange={setStockFilter}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="เลือกสถานะ" />
                               </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-2xl">
                                 <SelectItem value="all" className="text-base font-medium py-3">ทุกสถานะ</SelectItem>
                                 <SelectItem value="normal" className="text-base font-medium py-3">สต็อกปกติ</SelectItem>
                                 <SelectItem value="low" className="text-base font-medium py-3">สต็อกต่ำ</SelectItem>
                                 <SelectItem value="out" className="text-base font-medium py-3">หมดสต็อก</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                           
                           {/* Items Per Page */}
                           <div className="space-y-2">
                             <label className="text-sm font-semibold text-gray-700">แสดงต่อหน้า</label>
                             <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                               <SelectTrigger className="w-full h-11 text-base border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                                 <SelectValue placeholder="จำนวนรายการ" />
                               </SelectTrigger>
                               <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl">
                                 <SelectItem value="5" className="text-base font-medium py-3">5 รายการ</SelectItem>
                                 <SelectItem value="10" className="text-base font-medium py-3">10 รายการ</SelectItem>
                                 <SelectItem value="25" className="text-base font-medium py-3">25 รายการ</SelectItem>
                                 <SelectItem value="50" className="text-base font-medium py-3">50 รายการ</SelectItem>
                                 <SelectItem value="100" className="text-base font-medium py-3">100 รายการ</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                           
                           {/* Results Summary */}
                           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                             <div className="flex items-center justify-between text-sm">
                               <span className="font-medium text-gray-700">ผลลัพธ์:</span>
                               <span className="font-bold text-purple-600">{filteredProducts.length} รายการ</span>
                             </div>
                             <div className="flex items-center justify-between text-sm mt-1">
                               <span className="text-gray-600">หน้า:</span>
                               <span className="font-medium text-gray-800">{currentPage} จาก {totalPages}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="flex justify-end gap-3 pt-4">
                           <Button
                             variant="outline"
                             onClick={() => setShowFilters(false)}
                             className="px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300"
                           >
                             ปิด
                           </Button>
                           <Button
                             onClick={() => {
                               setCategoryFilter('all');
                               setStockFilter('all');
                               setItemsPerPage(10);
                               setCurrentPage(1);
                             }}
                             className="px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                           >
                             รีเซ็ต
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                   </div>
                 </div>
               </div>
             </CardHeader>
             
             <CardContent className="p-6 relative z-10">
               {isLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                   <span className="ml-3 text-lg font-medium">กำลังโหลดข้อมูล...</span>
                 </div>
               ) : paginatedProducts.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground text-lg font-medium">
                   ไม่พบสินค้าที่ตรงกับการค้นหา
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {paginatedProducts.map((product, index) => (
                     <Card 
                       key={product.id}
                       className={`group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform cursor-pointer ${
                         selectedProducts.includes(product.id) ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                       }`}
                       onClick={() => handleSelectProduct(product.id)}
                     >
                       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       
                       {/* Product Image Placeholder */}
                       <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-t-2xl overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                           <Package className="h-16 w-16 text-purple-400" />
                         </div>
                         <div className="absolute top-3 right-3">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleSelectProduct(product.id);
                             }}
                             className="h-8 w-8 p-0 bg-white/80 hover:bg-white rounded-full"
                           >
                             {selectedProducts.includes(product.id) ? (
                               <CheckSquare className="h-4 w-4 text-purple-600" />
                             ) : (
                               <Square className="h-4 w-4 text-purple-600" />
                             )}
                           </Button>
                         </div>
                         <div className="absolute top-3 left-3">
                           <Badge 
                             variant={(product.current_stock || 0) > (product.min_stock || 0) ? 'default' : (product.current_stock || 0) > 0 ? 'secondary' : 'destructive'}
                             className={`text-xs font-bold px-2 py-1 ${
                               (product.current_stock || 0) > (product.min_stock || 0) 
                                 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                                 : (product.current_stock || 0) > 0 
                                   ? 'bg-orange-500/10 text-orange-600 border-orange-200' 
                                   : 'bg-red-500/10 text-red-600 border-red-200'
                             }`}
                           >
                             {(product.current_stock || 0) > (product.min_stock || 0) ? 'ปกติ' : (product.current_stock || 0) > 0 ? 'ต่ำ' : 'หมด'}
                           </Badge>
                         </div>
                       </div>
                       
                       <CardContent className="p-4 relative z-10">
                         <div className="space-y-3">
                           <div>
                             <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1" title={product.name}>
                               {product.name}
                             </h3>
                             <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                           </div>
                           
                           <div className="space-y-2">
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">หมวดหมู่:</span>
                               <span className="text-sm font-medium">{product.categories?.name || 'ไม่ระบุ'}</span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">สต็อก:</span>
                               <span className={`text-sm font-bold ${
                                 (product.current_stock || 0) <= (product.min_stock || 0) ? 'text-orange-600' : 'text-slate-700'
                               }`}>
                                 {(product.current_stock || 0).toLocaleString()}
                               </span>
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-gray-600">ราคา:</span>
                               <span className="text-sm font-bold text-green-600">
                                 ฿{(product.unit_price || 0).toLocaleString()}
                               </span>
                             </div>
                           </div>
                           
                           <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                             <div className="flex items-center gap-1">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEditProduct(product);
                                 }}
                                 className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg"
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteProduct(product);
                                 }}
                                 className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-8 w-8 p-0 hover:bg-gray-50 rounded-lg"
                             >
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
         )}

         {/* Pagination Controls */}
         {filteredProducts.length > 0 && viewMode === 'table' && (
           <Card className="group relative overflow-hidden backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1 transform">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <CardContent className="p-6 relative z-10">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 {/* Page Info */}
                 <div className="text-sm text-gray-600">
                   แสดง {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} จาก {filteredProducts.length} รายการ
                 </div>
                 
                 {/* Pagination Controls */}
                 <div className="flex items-center gap-2">
                   {/* Previous Button */}
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="h-10 w-10 p-0 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronLeft className="h-4 w-4" />
                   </Button>
                   
                   {/* Page Numbers */}
                   <div className="flex items-center gap-1">
                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                       let pageNum;
                       if (totalPages <= 5) {
                         pageNum = i + 1;
                       } else if (currentPage <= 3) {
                         pageNum = i + 1;
                       } else if (currentPage >= totalPages - 2) {
                         pageNum = totalPages - 4 + i;
                       } else {
                         pageNum = currentPage - 2 + i;
                       }
                       
                       return (
                         <Button
                           key={pageNum}
                           variant={currentPage === pageNum ? "default" : "outline"}
                           size="sm"
                           onClick={() => handlePageChange(pageNum)}
                           className={`h-10 w-10 p-0 rounded-2xl transition-all duration-300 ${
                             currentPage === pageNum
                               ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg'
                               : 'border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                           }`}
                         >
                           {pageNum}
                         </Button>
                       );
                     })}
                   </div>
                   
                   {/* Next Button */}
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="h-10 w-10 p-0 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
                 
                 {/* Items Per Page */}
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-600">แสดง:</span>
                   <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                     <SelectTrigger className="w-20 h-10 text-sm border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 focus-ring rounded-2xl">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl">
                       <SelectItem value="5" className="text-sm font-medium py-2">5</SelectItem>
                       <SelectItem value="10" className="text-sm font-medium py-2">10</SelectItem>
                       <SelectItem value="25" className="text-sm font-medium py-2">25</SelectItem>
                       <SelectItem value="50" className="text-sm font-medium py-2">50</SelectItem>
                       <SelectItem value="100" className="text-sm font-medium py-2">100</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
        </div>
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
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50 shadow-2xl border-0 rounded-2xl backdrop-blur-lg">
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
            <AlertDialogCancel className="border-2 border-red-200 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-105 transform">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-red-500/30"
            >
              ลบสินค้า
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}