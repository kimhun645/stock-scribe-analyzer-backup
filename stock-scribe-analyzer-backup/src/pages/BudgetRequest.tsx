import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Eye, Trash2, MoreHorizontal, Printer, Calendar, User, CreditCard, FileText, Clock, CheckCircle, Search, Filter, X, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Download, Upload, Grid3X3, List, CheckSquare, Square, MoreVertical, Copy, Star, Heart, TrendingUp, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { api, type BudgetRequest as DBBudgetRequest } from '@/lib/apiService';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { BarcodeScannerIndicator } from '@/components/ui/barcode-scanner-indicator';
import { GlobalSearch } from '@/components/Search/GlobalSearch';

import { AddBudgetRequestDialog } from '@/components/Dialogs/AddBudgetRequestDialog';

// Type for partial approval data we actually use
type ApprovalInfo = {
  approver_name: string;
  created_at: string;
  remark?: string;
};

export default function BudgetRequest() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DBBudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DBBudgetRequest | null>(null);
  const [approvalData, setApprovalData] = useState<ApprovalInfo | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<DBBudgetRequest | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Barcode scanner support
  const { scannerDetected, lastScannedCode } = useBarcodeScanner({
    onScan: (scannedCode) => {
      // Auto-search for budget request when barcode is scanned
      setSearchTerm(scannedCode);
      toast({
        title: "สแกนบาร์โค้ดสำเร็จ",
        description: `ค้นหาคำขอ: ${scannedCode}`,
      });
    },
    minLength: 3,
    timeout: 100
  });

  useEffect(() => {
    fetchRequests();
    // Reset all dialog states when component mounts
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setDetailDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedRequest(null);
  }, []);

  // Debug: Log dialog states
  useEffect(() => {
    console.log('Dialog states:', {
      addDialogOpen,
      editDialogOpen,
      detailDialogOpen,
      deleteDialogOpen,
      selectedRequest: selectedRequest?.request_no
    });
  }, [addDialogOpen, editDialogOpen, detailDialogOpen, deleteDialogOpen, selectedRequest]);

  useEffect(() => {
    const fetchApprovalData = async () => {
      if (selectedRequest && selectedRequest.status !== 'PENDING') {
        try {
          const approval = await api.getApprovalByRequestId(selectedRequest.id);
          if (approval) setApprovalData(approval);
          else setApprovalData(null);
        } catch (err) {
          console.error('Error fetching approval data:', err);
          setApprovalData(null);
        }
      } else {
        setApprovalData(null);
      }
    };
    fetchApprovalData();
  }, [selectedRequest]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgetRequests();
      // Ensure data is always an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      // Don't show error toast on initial load - just set empty array
      setRequests([]);
      // Only show error if it's not a connection issue
      if (err instanceof Error && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        toast({ 
          title: 'ไม่สามารถโหลดข้อมูลได้', 
          description: 'กรุณาตรวจสอบการเชื่อมต่อเครือข่าย', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!requestToDelete) return;
    try {
      await api.deleteBudgetRequest(requestToDelete.id);
      toast({ title: 'ลบสำเร็จ', description: `ลบคำขอ ${requestToDelete.request_no} เรียบร้อยแล้ว` });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      // Refresh list
      fetchRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถลบคำขอได้', variant: 'destructive' });
    }
  };

  // Handle edit action
  const handleEdit = async (editedRequest: DBBudgetRequest) => {
    if (!selectedRequest) return;
    try {
      await api.updateBudgetRequest(selectedRequest.id, editedRequest);
      toast({ title: 'แก้ไขสำเร็จ', description: `แก้ไขคำขอ ${selectedRequest.request_no} เรียบร้อยแล้ว` });
      setEditDialogOpen(false);
      setSelectedRequest(null);
      // Refresh list
      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถแก้ไขคำขอได้', variant: 'destructive' });
    }
  };

  const handlePrint = async (request: DBBudgetRequest) => {
    let approvalInfo: ApprovalInfo | null = null;
    if (request.status !== 'PENDING') {
      try {
        const data = await api.getApprovalByRequestId(request.id);
        approvalInfo = data;
      } catch (err) {
        console.error('Error fetching approval data for print:', err);
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsTable = request.material_list?.length && Array.isArray(request.material_list)
      ? `<table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:12px;"><thead><tr style="background-color:#f5f5f5;"><th style="border:1px solid #ccc;padding:8px;text-align:left;">รายการ</th><th style="border:1px solid #ccc;padding:8px;text-align:left;">จำนวน</th></tr></thead><tbody>${request.material_list
          .map(
            (item, idx) => `<tr><td style="border:1px solid #ccc;padding:8px;">${item.item}</td><td style="border:1px solid #ccc;padding:8px;">${item.quantity}</td></tr>`
          )
          .join('')}</tbody></table>`
      : `<p style="text-align:center;color:#666;font-size:12px;margin:15px 0;">ไม่มีรายการวัสดุ</p>`;

    const printContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>คำขออนุมัติใช้งบประมาณ ${request.request_no}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 1.5cm; 
    }
    body { 
      font-family: 'Sarabun', 'Tahoma', sans-serif; 
      font-size: 12px; 
      line-height: 1.4; 
      margin: 0; 
      padding: 0;
      color: #333;
    }
    .header { 
      text-align: center; 
      margin-bottom: 20px; 
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .header h1 { 
      font-size: 18px; 
      margin: 0 0 5px 0; 
      font-weight: bold;
    }
    .header p { 
      font-size: 14px; 
      margin: 0; 
      color: #666;
    }
    .info-section { 
      margin: 15px 0; 
    }
    .info-row { 
      display: flex; 
      margin-bottom: 8px; 
      font-size: 12px;
    }
    .info-label { 
      font-weight: bold; 
      width: 120px; 
      flex-shrink: 0;
    }
    .info-value { 
      flex: 1;
    }
    .amount-highlight { 
      font-size: 16px; 
      font-weight: bold; 
      color: #2563eb;
    }
    .approval-section { 
      margin: 20px 0; 
      padding: 15px; 
      border: 1px solid #007bff; 
      background-color: #f8f9ff;
      border-radius: 5px;
    }
    .approval-section h3 { 
      margin: 0 0 10px 0; 
      font-size: 14px; 
      color: #007bff;
    }
    .material-section { 
      margin: 20px 0; 
    }
    .material-section h3 { 
      margin: 0 0 10px 0; 
      font-size: 14px; 
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .note-section { 
      margin: 15px 0; 
      padding: 10px; 
      background-color: #f9f9f9; 
      border-left: 4px solid #666;
      font-size: 11px;
    }
    .footer { 
      margin-top: 30px; 
      text-align: center; 
      color: #666; 
      font-size: 10px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>คำขออนุมัติใช้งบประมาณ</h1>
    <p>เลขที่คำขอ: ${request.request_no}</p>
  </div>
  
  <div class="info-section">
    <div class="info-row">
      <div class="info-label">ผู้ขอ:</div>
      <div class="info-value">${request.requester}</div>
    </div>
    <div class="info-row">
      <div class="info-label">วันที่ขอ:</div>
      <div class="info-value">${new Date(request.request_date).toLocaleDateString('th-TH')}</div>
    </div>
    <div class="info-row">
      <div class="info-label">รหัสบัญชี:</div>
      <div class="info-value">${request.account_code} ${request.account_name ? '- ' + request.account_name : ''}</div>
    </div>
    <div class="info-row">
      <div class="info-label">จำนวนเงิน:</div>
      <div class="info-value amount-highlight">฿${parseFloat((Number(request.amount) || 0).toFixed(2)).toLocaleString('th-TH')}</div>
    </div>
    <div class="info-row">
      <div class="info-label">สถานะ:</div>
      <div class="info-value">${request.status === 'PENDING' ? 'รอการอนุมัติ' : request.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}</div>
    </div>
  </div>
  
  ${request.note ? `
  <div class="note-section">
    <strong>หมายเหตุ:</strong> ${request.note}
  </div>
  ` : ''}
  
  <div class="material-section">
    <h3>รายการวัสดุ</h3>
    ${itemsTable}
  </div>
  
  ${approvalInfo ? `
  <div class="approval-section">
    <h3>ข้อมูลการอนุมัติ</h3>
    <div class="info-row">
      <div class="info-label">ผู้อนุมัติ:</div>
      <div class="info-value">${approvalInfo.approver_name}</div>
    </div>
    <div class="info-row">
      <div class="info-label">วันที่อนุมัติ:</div>
      <div class="info-value">${new Date(approvalInfo.created_at).toLocaleString('th-TH')}</div>
    </div>
    ${approvalInfo.remark ? `
    <div class="info-row">
      <div class="info-label">หมายเหตุ:</div>
      <div class="info-value">${approvalInfo.remark}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</p>
  </div>
</body>
</html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอการอนุมัติ</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">อนุมัติแล้ว</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">ไม่อนุมัติ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filtered requests based on search and filters
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) {
      return [];
    }
    return requests.filter(request => {
      // Search term filter
      const searchMatch = searchTerm === '' || 
        request.request_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.account_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.note?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'ALL' || request.status === statusFilter;

      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const requestDate = new Date(request.request_date);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          dateMatch = dateMatch && requestDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          dateMatch = dateMatch && requestDate <= toDate;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }, [requests, searchTerm, statusFilter, dateFrom, dateTo]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || dateFrom || dateTo;

  // Calculate statistics for filtered data
  const filteredStats = useMemo(() => {
    if (!hasActiveFilters || !Array.isArray(filteredRequests)) return null;
    
    const totalAmount = Array.isArray(filteredRequests) ? filteredRequests.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : 0;
    const pendingAmount = Array.isArray(filteredRequests) ? filteredRequests
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : 0;
    const approvedAmount = Array.isArray(filteredRequests) ? filteredRequests
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : 0;
    const rejectedAmount = Array.isArray(filteredRequests) ? filteredRequests
      .filter(r => r.status === 'REJECTED')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : 0;

    return {
      total: Array.isArray(filteredRequests) ? filteredRequests.length : 0,
      pending: Array.isArray(filteredRequests) ? filteredRequests.filter(r => r.status === 'PENDING').length : 0,
      approved: Array.isArray(filteredRequests) ? filteredRequests.filter(r => r.status === 'APPROVED').length : 0,
      rejected: Array.isArray(filteredRequests) ? filteredRequests.filter(r => r.status === 'REJECTED').length : 0,
      totalAmount,
      pendingAmount,
      approvedAmount,
      rejectedAmount
    };
  }, [filteredRequests, hasActiveFilters]);

  if (loading) {
    return (
      <Layout hideHeader={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Professional Page Header */}
        <PageHeader 
          title="คำขออนุมัติใช้งบประมาณ"
          description="จัดการคำขออนุมัติและติดตามสถานะการอนุมัติ"
          icon={FileText}
          stats={[
            {
              label: "คำขอทั้งหมด",
              value: Array.isArray(requests) ? requests.length.toString() : "0",
              icon: FileText
            },
            {
              label: "รอการอนุมัติ",
              value: Array.isArray(requests) ? requests.filter(r => r.status === 'PENDING').length.toString() : "0",
              icon: Clock
            },
            {
              label: "อนุมัติแล้ว",
              value: Array.isArray(requests) ? requests.filter(r => r.status === 'APPROVED').length.toString() : "0",
              icon: CheckCircle
            },
            {
              label: "ไม่อนุมัติ",
              value: Array.isArray(requests) ? requests.filter(r => r.status === 'REJECTED').length.toString() : "0",
              icon: X
            },
            {
              label: "มูลค่ารวมทั้งหมด",
              value: `฿${Array.isArray(requests) ? parseFloat(requests
                .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                .toFixed(2)).toLocaleString() : "0"}`,
              icon: CreditCard
            },
            {
              label: "มูลค่ารวม (รออนุมัติ)",
              value: `฿${Array.isArray(requests) ? parseFloat(requests
                .filter(r => r.status === 'PENDING')
                .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                .toFixed(2)).toLocaleString() : "0"}`,
              icon: Clock
            },
            {
              label: "มูลค่ารวม (อนุมัติแล้ว)",
              value: `฿${Array.isArray(requests) ? parseFloat(requests
                .filter(r => r.status === 'APPROVED')
                .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                .toFixed(2)).toLocaleString() : "0"}`,
              icon: CheckCircle
            }
          ]}
          primaryAction={{
            label: "เพิ่มคำขอใหม่",
            icon: Plus,
            onClick: () => {
              // Close all other dialogs first
              setEditDialogOpen(false);
              setDetailDialogOpen(false);
              setDeleteDialogOpen(false);
              setSelectedRequest(null);
              // Then open add dialog
              setAddDialogOpen(true);
            }
          }}
        />

        {/* Search and Filter Section */}
        <Card className="bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-200 shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200 rounded-full translate-y-40 -translate-x-40 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-200 rounded-full -translate-x-24 -translate-y-24 blur-2xl"></div>
          </div>
          
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="space-y-6">
              {/* Scanner Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl text-muted-foreground font-semibold">สถานะเครื่องสแกน:</span>
                  <BarcodeScannerIndicator isDetected={scannerDetected} />
                </div>
                {scannerDetected && (
                  <p className="text-base text-green-700 font-semibold bg-green-100 px-4 py-2 rounded-full border-2 border-green-300 shadow-sm">
                    ✨ พร้อมใช้งาน - สแกนบาร์โค้ดเพื่อค้นหาคำขอ
                  </p>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาจากเลขที่คำขอ, ผู้ขอ, รหัสบัญชี, หรือหมายเหตุ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg h-14 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-200/50 bg-white/90 backdrop-blur-sm font-medium placeholder:text-muted-foreground/70"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-red-50"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 h-14 px-6 text-base font-medium border-2 border-blue-200 hover:border-blue-500 focus:ring-4 focus:ring-blue-200/50"
                >
                  <Filter className="h-5 w-5" />
                  ตัวกรอง
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="gap-2 h-14 px-6 text-base font-medium border-2 border-orange-200 hover:border-orange-500 focus:ring-4 focus:ring-orange-200/50"
                  >
                    <X className="h-4 w-4" />
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>

              {/* Filtered Statistics */}
              {filteredStats && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    สถิติข้อมูลที่กรองแล้ว
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{filteredStats.total}</div>
                      <div className="text-blue-700">รายการทั้งหมด</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{filteredStats.pending}</div>
                      <div className="text-yellow-700">รออนุมัติ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{filteredStats.approved}</div>
                      <div className="text-green-700">อนุมัติแล้ว</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{filteredStats.rejected}</div>
                      <div className="text-red-700">ไม่อนุมัติ</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">฿{parseFloat(filteredStats.totalAmount.toFixed(2)).toLocaleString()}</div>
                        <div className="text-blue-700">มูลค่ารวม</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">฿{parseFloat(filteredStats.pendingAmount.toFixed(2)).toLocaleString()}</div>
                        <div className="text-yellow-700">มูลค่ารออนุมัติ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">฿{parseFloat(filteredStats.approvedAmount.toFixed(2)).toLocaleString()}</div>
                        <div className="text-green-700">มูลค่าอนุมัติแล้ว</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-green-200">
                  <div className="space-y-3">
                    <Label htmlFor="status-filter" className="text-base font-semibold text-green-800">สถานะ</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-12 text-base border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-200/50 bg-white/90 backdrop-blur-sm font-medium">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-green-200">
                        <SelectItem value="ALL" className="text-base font-medium py-3">ทั้งหมด</SelectItem>
                        <SelectItem value="PENDING" className="text-base font-medium py-3">รอการอนุมัติ</SelectItem>
                        <SelectItem value="APPROVED" className="text-base font-medium py-3">อนุมัติแล้ว</SelectItem>
                        <SelectItem value="REJECTED" className="text-base font-medium py-3">ไม่อนุมัติ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="date-from" className="text-base font-semibold text-blue-800">วันที่เริ่มต้น</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/90 backdrop-blur-sm font-medium"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="date-to" className="text-base font-semibold text-blue-800">วันที่สิ้นสุด</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white/90 backdrop-blur-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add New Request Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            setSelectedRequest(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>เพิ่มคำขออนุมัติใช้งบประมาณ</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลคำขออนุมัติใช้งบประมาณใหม่
              </DialogDescription>
            </DialogHeader>
            <AddBudgetRequestDialog 
              onSuccess={() => {
                setAddDialogOpen(false);
                setSelectedRequest(null);
                fetchRequests();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Requests List */}
        <div className="grid gap-4">
          {!Array.isArray(filteredRequests) || filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                {hasActiveFilters ? (
                  <>
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ไม่พบผลลัพธ์การค้นหา</h3>
                    <p className="text-muted-foreground mb-4">
                      ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      ล้างตัวกรอง
                    </Button>
                  </>
                ) : (
                  <>
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ยังไม่มีคำขออนุมัติ</h3>
                    <p className="text-muted-foreground mb-4">
                      เริ่มต้นโดยการสร้างคำขออนุมัติใช้งบประมาณใหม่
                    </p>
                    <Button onClick={() => {
                      // Close all other dialogs first
                      setEditDialogOpen(false);
                      setDetailDialogOpen(false);
                      setDeleteDialogOpen(false);
                      setSelectedRequest(null);
                      // Then open add dialog
                      setAddDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มคำขอใหม่
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            Array.isArray(filteredRequests) && filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">{request.request_no}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">ผู้ขอ:</span>
                          <span className="font-medium">{request.requester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">วันที่:</span>
                          <span>{new Date(request.request_date).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">จำนวน:</span>
                          <span className="font-semibold text-primary">
                            ฿{parseFloat((Number(request.amount) || 0).toFixed(2)).toLocaleString('th-TH')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>บัญชี: {request.account_code} - {request.account_name}</span>
                      </div>
                    </div>

                     <div className="flex items-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSelectedRequest(request);
                           setDetailDialogOpen(true);
                         }}
                       >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePrint(request)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            พิมพ์
                          </DropdownMenuItem>
                          {request.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Close all other dialogs first
                                  setAddDialogOpen(false);
                                  setDetailDialogOpen(false);
                                  setDeleteDialogOpen(false);
                                  // Then set selected request and open edit dialog
                                  setSelectedRequest(request);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setRequestToDelete(request);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบ
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>รายละเอียดคำขออนุมัติ</DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedRequest && (
                    <Button 
                      onClick={() => handlePrint(selectedRequest)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      พิมพ์
                    </Button>
                  )}
                  <Button 
                    onClick={() => setDetailDialogOpen(false)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    ปิด
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">เลขที่คำขอ</span>
                     <p className="text-lg font-semibold">{selectedRequest.request_no}</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">สถานะ</span>
                     <div>{getStatusBadge(selectedRequest.status)}</div>
                   </div>
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">ผู้ขอ</span>
                     <p>{selectedRequest.requester}</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">วันที่ขอ</span>
                     <p>{new Date(selectedRequest.request_date).toLocaleDateString('th-TH')}</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">รหัสบัญชี</span>
                     <p>{selectedRequest.account_code} - {selectedRequest.account_name}</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">จำนวนเงิน</span>
                     <p className="text-2xl font-bold text-primary">
                       ฿{parseFloat((Number(selectedRequest.amount) || 0).toFixed(2)).toLocaleString('th-TH')}
                     </p>
                   </div>
                   {approvalData && (
                     <>
                       <div className="space-y-2">
                         <span className="text-sm font-medium text-muted-foreground">ผู้อนุมัติ</span>
                         <p className="font-medium">{approvalData.approver_name}</p>
                       </div>
                       <div className="space-y-2">
                         <span className="text-sm font-medium text-muted-foreground">วันที่อนุมัติ</span>
                         <p>{new Date(approvalData.created_at).toLocaleDateString('th-TH', { 
                           year: 'numeric', 
                           month: 'long', 
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}</p>
                       </div>
                     </>
                   )}
                 </div>

                 {approvalData?.remark && (
                   <div className="space-y-2">
                     <span className="text-sm font-medium text-muted-foreground">หมายเหตุจากผู้อนุมัติ</span>
                     <p className="bg-muted p-3 rounded-lg border-l-4 border-primary">{approvalData.remark}</p>
                   </div>
                 )}

                {selectedRequest.note && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">หมายเหตุ</span>
                    <p className="bg-muted p-3 rounded-lg">{selectedRequest.note}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">รายการวัสดุ</span>
                  {selectedRequest.material_list && Array.isArray(selectedRequest.material_list) && selectedRequest.material_list.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">รายการ</th>
                            <th className="text-left p-3 font-medium">จำนวน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(selectedRequest.material_list) && selectedRequest.material_list.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{item.item || 'ไม่ระบุ'}</td>
                              <td className="p-3">{item.quantity || 'ไม่ระบุ'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg text-center">
                      ไม่มีรายการวัสดุที่ระบุ
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบคำขอเลขที่ {requestToDelete?.request_no} หรือไม่?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Request Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedRequest(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไขคำขออนุมัติใช้งบประมาณ</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลคำขอ {selectedRequest?.request_no}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <AddBudgetRequestDialog
                onSuccess={() => {
                  setEditDialogOpen(false);
                  setSelectedRequest(null);
                  fetchRequests();
                }}
                editRequest={selectedRequest}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}