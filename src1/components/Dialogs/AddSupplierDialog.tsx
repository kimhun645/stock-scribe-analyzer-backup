import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  X, 
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api, type Supplier } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';

interface AddSupplierDialogProps {
  onSupplierAdded?: () => void;
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function AddSupplierDialog({ onSupplierAdded }: AddSupplierDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>();

  const onSubmit = async (data: SupplierFormData) => {
    setIsLoading(true);
    try {
      const newSupplier: Omit<Supplier, 'id' | 'created_at'> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      };

      await api.createSupplier(newSupplier);

      toast({
        title: "สำเร็จ",
        description: "เพิ่มผู้จัดหาสำเร็จแล้ว",
      });

      reset();
      setOpen(false);
      onSupplierAdded?.();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มผู้จัดหาได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { watch } = useForm<SupplierFormData>();
  const supplierName = watch('name');
  const supplierEmail = watch('email');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Building2 className="mr-2 h-4 w-4" />
          เพิ่มผู้จัดหา
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  เพิ่มผู้จัดหา
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  สร้างข้อมูลผู้จัดหาหรือซัพพลายเออร์ในระบบ
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
          {/* Company Information Card */}
          <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-orange-800">
                <Building2 className="mr-2 h-5 w-5" />
                ข้อมูลบริษัท
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                  ชื่อผู้จัดหา *
                </Label>
                <Input
                  id="name"
                  {...register('name', { 
                    required: 'กรุณากรอกชื่อผู้จัดหา',
                    minLength: {
                      value: 2,
                      message: 'ชื่อผู้จัดหาต้องมีอย่างน้อย 2 ตัวอักษร'
                    },
                    maxLength: {
                      value: 100,
                      message: 'ชื่อผู้จัดหาต้องไม่เกิน 100 ตัวอักษร'
                    }
                  })}
                  placeholder="ชื่อบริษัทหรือผู้จัดหา"
                  className="h-12 text-base border-2 border-orange-200 focus:border-orange-500"
                />
                {errors.name && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-blue-800">
                <User className="mr-2 h-5 w-5" />
                ข้อมูลการติดต่อ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                    อีเมล *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'กรุณากรอกอีเมล',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'รูปแบบอีเมลไม่ถูกต้อง'
                        }
                      })}
                      placeholder="email@example.com"
                      className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 pl-10"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.email.message}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                    เบอร์โทรศัพท์ *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      {...register('phone', { 
                        required: 'กรุณากรอกเบอร์โทรศัพท์',
                        pattern: {
                          value: /^[0-9\-\+\(\)\s]+$/,
                          message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
                        },
                        minLength: {
                          value: 9,
                          message: 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'
                        }
                      })}
                      placeholder="0xx-xxx-xxxx"
                      className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 pl-10"
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.phone.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information Card */}
          <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-green-800">
                <MapPin className="mr-2 h-5 w-5" />
                ที่อยู่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold text-gray-700">
                  ที่อยู่ *
                </Label>
                <Textarea
                  id="address"
                  {...register('address', { 
                    required: 'กรุณากรอกที่อยู่',
                    minLength: {
                      value: 10,
                      message: 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'
                    },
                    maxLength: {
                      value: 500,
                      message: 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร'
                    }
                  })}
                  placeholder="ที่อยู่ของผู้จัดหา (บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)"
                  rows={3}
                  className="text-base border-2 border-green-200 focus:border-green-500"
                />
                {errors.address && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.address.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {(supplierName || supplierEmail) && (
            <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-purple-800">
                  <Briefcase className="mr-2 h-5 w-5" />
                  ตัวอย่างข้อมูลผู้จัดหา
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="space-y-3">
                    {supplierName && (
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-gray-800">{supplierName}</span>
                      </div>
                    )}
                    {supplierEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">{supplierEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        ผู้จัดหา
                      </Badge>
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
              className="h-12 px-8 text-base bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  สร้างผู้จัดหา
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}