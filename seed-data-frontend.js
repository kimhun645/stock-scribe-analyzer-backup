import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsXLEXI4e_3hoK_Aef6EIOwygxTJGtLek",
  authDomain: "stock-6e930.firebaseapp.com",
  projectId: "stock-6e930",
  storageBucket: "stock-6e930.firebasestorage.app",
  messagingSenderId: "1067364434675",
  appId: "1:1067364434675:web:453eed567f011715586d86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ข้อมูลตัวอย่างสำหรับแต่ละ collection
const sampleData = {
  products: [
    {
      name: "สินค้าตัวอย่าง 1",
      sku: "SKU001",
      barcode: "1234567890123",
      category: "อุปกรณ์สำนักงาน",
      supplier: "ผู้จัดจำหน่าย A",
      currentStock: 100,
      minStock: 10,
      maxStock: 500,
      unitPrice: 150.00,
      description: "สินค้าตัวอย่างสำหรับทดสอบระบบ"
    }
  ],
  categories: [
    {
      name: "อุปกรณ์สำนักงาน",
      description: "อุปกรณ์สำนักงานทั่วไป",
      color: "#3B82F6"
    }
  ],
  suppliers: [
    {
      name: "ผู้จัดจำหน่าย A",
      contact: "นาย ก",
      phone: "02-123-4567",
      email: "supplier@example.com",
      address: "123 ถนนตัวอย่าง กรุงเทพฯ 10110"
    }
  ],
  movements: [
    {
      productId: "product1",
      type: "in",
      quantity: 100,
      reason: "รับสินค้าใหม่",
      reference: "PO001",
      createdBy: "admin",
      createdAt: new Date()
    }
  ],
  users: [
    {
      username: "admin",
      email: "admin@example.com",
      role: "admin",
      isActive: true,
      createdAt: new Date()
    }
  ],
  budgetRequests: [
    {
      requestNo: "BR001",
      title: "คำของบประมาณตัวอย่าง",
      amount: 50000,
      status: "pending",
      requester: "admin",
      createdAt: new Date()
    }
  ],
  approvals: [
    {
      requestId: "BR001",
      approver: "manager",
      status: "pending",
      comment: "",
      createdAt: new Date()
    }
  ],
  approvers: [
    {
      name: "manager",
      email: "manager@example.com",
      level: 1,
      isActive: true
    }
  ],
  requesters: [
    {
      name: "admin",
      email: "admin@example.com",
      department: "IT",
      isActive: true
    }
  ],
  accountCodes: [
    {
      code: "ACC001",
      name: "บัญชีตัวอย่าง",
      type: "expense",
      isActive: true
    }
  ],
  accessCodes: [
    {
      code: "ACCESS001",
      name: "รหัสเข้าถึงตัวอย่าง",
      permissions: ["read", "write"],
      isActive: true
    }
  ],
  approvalLogs: [
    {
      requestId: "BR001",
      action: "created",
      user: "admin",
      timestamp: new Date(),
      details: "สร้างคำขอใหม่"
    }
  ],
  appSettings: [
    {
      key: "company_name",
      value: "บริษัทตัวอย่าง จำกัด",
      type: "string"
    }
  ]
};

// ฟังก์ชันเพิ่มข้อมูลใน collection
async function addSampleDataToCollection(collectionName, data) {
  try {
    console.log(`📝 เพิ่มข้อมูลใน ${collectionName}...`);
    
    for (const item of data) {
      const docRef = await addDoc(collection(db, collectionName), item);
      console.log(`✅ เพิ่ม ${collectionName} document: ${docRef.id}`);
    }
    
    console.log(`✅ เพิ่มข้อมูลใน ${collectionName} สำเร็จ`);
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูลใน ${collectionName}:`, error);
  }
}

// ฟังก์ชันหลัก
async function seedData() {
  console.log('🌱 เริ่มเพิ่มข้อมูลตัวอย่าง...');
  
  try {
    // เพิ่มข้อมูลในแต่ละ collection
    for (const [collectionName, data] of Object.entries(sampleData)) {
      await addSampleDataToCollection(collectionName, data);
    }
    
    console.log('🎉 เพิ่มข้อมูลตัวอย่างเสร็จสิ้น!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

// รันฟังก์ชัน
seedData();
