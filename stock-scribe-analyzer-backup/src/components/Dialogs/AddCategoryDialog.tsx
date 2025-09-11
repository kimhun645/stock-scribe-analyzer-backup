import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  X, 
  Loader2,
  FolderPlus,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  Tag,
  Package,
  Pill
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api, type Category } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';

interface AddCategoryDialogProps {
  onCategoryAdded?: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  is_medicine: boolean;
}

export function AddCategoryDialog({ onCategoryAdded }: AddCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      is_medicine: false
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const newCategory: Omit<Category, 'id' | 'created_at'> = {
        name: data.name,
        description: data.description,
        is_medicine: data.is_medicine
      };

      await api.createCategory(newCategory);

      toast({
        title: "สำเร็จ",
        description: "เพิ่มหมวดหมู่สำเร็จแล้ว",
      });

      reset();
      setOpen(false);
      onCategoryAdded?.();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มหมวดหมู่ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isMedicine = watch('is_medicine');
  const categoryName = watch('name');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <FolderPlus className="mr-2 h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <FolderPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  เพิ่มหมวดหมู่
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  สร้างหมวดหมู่ใหม่สำหรับจัดกลุ่มสินค้าในระบบ
                </DialogDescription>
              </div>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-emerald-800">
                <Tag className="mr-2 h-5 w-5" />
                ข้อมูลพื้นฐาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                  ชื่อหมวดหมู่ *
                </Label>
                <Input
                  id="name"
                  {...register('name', { 
                    required: 'กรุณากรอกชื่อหมวดหมู่',
                    minLength: {
                      value: 2,
                      message: 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร'
                    },
                    maxLength: {
                      value: 50,
                      message: 'ชื่อหมวดหมู่ต้องไม่เกิน 50 ตัวอักษร'
                    }
                  })}
                  placeholder="เช่น อิเล็กทรอนิกส์, เครื่องใช้ไฟฟ้า, ยาและเวชภัณฑ์"
                  className="h-12 text-base border-2 border-emerald-200 focus:border-emerald-500"
                />
                {errors.name && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                  คำอธิบาย *
                </Label>
                <Textarea
                  id="description"
                  {...register('description', { 
                    required: 'กรุณากรอกคำอธิบาย',
                    minLength: {
                      value: 5,
                      message: 'คำอธิบายต้องมีอย่างน้อย 5 ตัวอักษร'
                    },
                    maxLength: {
                      value: 200,
                      message: 'คำอธิบายต้องไม่เกิน 200 ตัวอักษร'
                    }
                  })}
                  placeholder="อธิบายรายละเอียดเกี่ยวกับหมวดหมู่นี้ เช่น ประเภทสินค้า, การใช้งาน, หรือข้อกำหนดพิเศษ"
                  rows={3}
                  className="text-base border-2 border-emerald-200 focus:border-emerald-500"
                />
                {errors.description && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.description.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Type Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-blue-800">
                <Shield className="mr-2 h-5 w-5" />
                ประเภทหมวดหมู่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                  <Checkbox 
                    id="is_medicine"
                    checked={isMedicine}
                    onCheckedChange={(checked) => setValue('is_medicine', checked as boolean)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="is_medicine" className="text-base font-semibold text-gray-700 cursor-pointer">
                      หมวดหมู่ยาและเวชภัณฑ์
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      หมวดหมู่สำหรับยาและเวชภัณฑ์ที่ต้องระบุวันหมดอายุ
                    </p>
                  </div>
                  {isMedicine && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      <Pill className="mr-1 h-3 w-3" />
                      ยา
                    </Badge>
                  )}
                </div>
                
                {isMedicine && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">ข้อกำหนดพิเศษสำหรับหมวดหมู่ยา</h4>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• ต้องระบุวันหมดอายุเมื่อเพิ่มสินค้า</li>
                          <li>• ระบบจะแจ้งเตือนเมื่อสินค้าใกล้หมดอายุ</li>
                          <li>• ต้องระบุเลขที่ใบอนุญาต (ถ้ามี)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {categoryName && (
            <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-purple-800">
                  <Package className="mr-2 h-5 w-5" />
                  ตัวอย่างหมวดหมู่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{categoryName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {watch('description') || 'คำอธิบายจะแสดงที่นี่'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {isMedicine ? (
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          <Pill className="mr-1 h-3 w-3" />
                          หมวดหมู่ยา
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                          <Package className="mr-1 h-3 w-3" />
                          หมวดหมู่ทั่วไป
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="h-12 px-6 text-base border-2 border-gray-300 hover:border-gray-400"
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-12 px-8 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  สร้างหมวดหมู่
                </>
              )}
            </Button>
          </div>
        </form>
        </DialogContent>
    </Dialog>
  );
}