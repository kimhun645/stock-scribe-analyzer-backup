import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Loader2, 
  X, 
  Package, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  Hash, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/apiService';
interface ProductForMovement {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
}

interface AddMovementDialogProps {
  onMovementAdded: () => void;
}

export function AddMovementDialog({ onMovementAdded }: AddMovementDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductForMovement[]>([]);
  
  const [formData, setFormData] = useState({
    product_id: '',
    type: '' as 'in' | 'out' | '',
    quantity: '',
    reason: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลสินค้าได้",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.type || !formData.quantity || !formData.reason) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณาระบุสินค้า ประเภท จำนวน และเหตุผล",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast({
        title: "จำนวนไม่ถูกต้อง",
        description: "กรุณาระบุจำนวนที่มากกว่า 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current product stock
      const product = await api.getProductById(formData.product_id);
      if (!product) throw new Error('ไม่พบสินค้า');

      // Check if stock out is possible
      if (formData.type === 'out' && (product.current_stock || 0) < quantity) {
        toast({
          title: "สต็อกไม่เพียงพอ",
          description: `สต็อกปัจจุบัน: ${product.current_stock || 0} ไม่เพียงพอสำหรับการเบิก ${quantity}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Add movement record
              await api.createMovement({
        product_id: formData.product_id,
        type: formData.type,
        quantity: quantity,
        reason: formData.reason,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      });

      // Update product stock
      const newStock = formData.type === 'in' 
        ? (product.current_stock || 0) + quantity
        : (product.current_stock || 0) - quantity;

              await api.updateProduct(formData.product_id, {
        current_stock: newStock
      });

      toast({
        title: "บันทึกข้อมูลเรียบร้อย",
        description: `บันทึกการ${formData.type === 'in' ? 'รับเข้า' : 'เบิกออก'} ${quantity} หน่วยเรียบร้อยแล้ว`,
      });

      // Reset form
      setFormData({
        product_id: '',
        type: '' as 'in' | 'out' | '',
        quantity: '',
        reason: '',
        reference: '',
        notes: ''
      });
      
      setOpen(false);
      onMovementAdded();

    } catch (error) {
      console.error('Error adding movement:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const isStockOut = formData.type === 'out';
  const isStockIn = formData.type === 'in';
  const quantity = parseInt(formData.quantity) || 0;
  const newStock = selectedProduct ? 
    (isStockIn ? (selectedProduct.current_stock || 0) + quantity : (selectedProduct.current_stock || 0) - quantity) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          บันทึกการเคลื่อนไหว
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  บันทึกการเคลื่อนไหวสต็อก
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  บันทึกการรับเข้าหรือเบิกออกสินค้าในระบบ
                </DialogDescription>
              </div>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-blue-800">
                <Package className="mr-2 h-5 w-5" />
                เลือกสินค้า
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product" className="text-base font-semibold text-gray-700">
                  สินค้า *
                </Label>
                <Select value={formData.product_id} onValueChange={(value) => setFormData({...formData, product_id: value})}>
                  <SelectTrigger className="h-12 text-base border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="เลือกสินค้าที่ต้องการบันทึกการเคลื่อนไหว" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            สต็อก: {product.current_stock || 0}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProduct && (
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      สต็อกปัจจุบัน: {selectedProduct.current_stock}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movement Type and Quantity Card */}
          <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-green-800">
                <TrendingUp className="mr-2 h-5 w-5" />
                รายละเอียดการเคลื่อนไหว
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-base font-semibold text-gray-700">
                    ประเภทการเคลื่อนไหว *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as 'in' | 'out'})}>
                    <SelectTrigger className="h-12 text-base border-2 border-green-200 focus:border-green-500">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in" className="py-3">
                        <div className="flex items-center">
                          <ArrowUp className="mr-2 h-4 w-4 text-green-600" />
                          <span className="font-semibold">รับเข้า (Stock In)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="out" className="py-3">
                        <div className="flex items-center">
                          <ArrowDown className="mr-2 h-4 w-4 text-red-600" />
                          <span className="font-semibold">เบิกออก (Stock Out)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-base font-semibold text-gray-700">
                    จำนวน *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="จำนวนที่ต้องการ"
                    className="h-12 text-base border-2 border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Stock Preview */}
              {selectedProduct && formData.type && formData.quantity && (
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isStockIn ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold text-gray-800">
                        สต็อกหลังการเคลื่อนไหว:
                      </span>
                    </div>
                    <Badge 
                      className={`${
                        isStockIn 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {(newStock || 0).toLocaleString()}
                    </Badge>
                  </div>
                  {isStockOut && newStock < 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">
                        ⚠️ สต็อกไม่เพียงพอสำหรับการเบิกออก
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-purple-800">
                <FileText className="mr-2 h-5 w-5" />
                ข้อมูลเพิ่มเติม
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-base font-semibold text-gray-700">
                  เหตุผล *
                </Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})}>
                  <SelectTrigger className="h-12 text-base border-2 border-purple-200 focus:border-purple-500">
                    <SelectValue placeholder="เลือกเหตุผลของการเคลื่อนไหว" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase" className="py-3">
                      <div className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        <span>การสั่งซื้อ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Return" className="py-3">
                      <div className="flex items-center">
                        <ArrowUp className="mr-2 h-4 w-4 text-blue-600" />
                        <span>การคืนสินค้า</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Adjustment" className="py-3">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-orange-600" />
                        <span>การปรับปรุงสต็อก</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Sale" className="py-3">
                      <div className="flex items-center">
                        <ArrowDown className="mr-2 h-4 w-4 text-red-600" />
                        <span>การขาย</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Damaged" className="py-3">
                      <div className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                        <span>สินค้าเสียหาย</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Transfer" className="py-3">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />
                        <span>การโอนย้าย</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Other" className="py-3">
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
                        <span>อื่นๆ</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base font-semibold text-gray-700">
                  เลขที่อ้างอิง
                </Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  placeholder="เลขที่ใบสั่งซื้อ/ใบส่งของ/ใบเบิก"
                  className="h-12 text-base border-2 border-purple-200 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold text-gray-700">
                  หมายเหตุ
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการเคลื่อนไหวนี้..."
                  rows={3}
                  className="text-base border-2 border-purple-200 focus:border-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-12 px-6 text-base border-2 border-gray-300 hover:border-gray-400"
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (isStockOut && newStock < 0)}
              className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  บันทึกการเคลื่อนไหว
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}