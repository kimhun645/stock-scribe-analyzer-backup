import admin from "firebase-admin";

// Initialize Firebase Admin SDK with project ID
admin.initializeApp({
  projectId: 'stock-6e930'
});

const db = admin.firestore();

// ข้อมูลตัวอย่างสำหรับแต่ละ collection
const sampleData = {
  products: {
    name: "สินค้าตัวอย่าง",
    sku: "SKU001",
    description: "สินค้าตัวอย่างสำหรับทดสอบ",
    category: "หมวดหมู่ทั่วไป",
    supplier: "ผู้จัดจำหน่ายตัวอย่าง",
    price: 100.50,
    stock: 50,
    min_stock: 10,
    max_stock: 100,
    unit: "ชิ้น",
    location: "คลัง A",
    barcode: "1234567890123",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  categories: {
    name: "หมวดหมู่ตัวอย่าง",
    description: "หมวดหมู่สินค้าตัวอย่างสำหรับทดสอบ",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  suppliers: {
    name: "ผู้จัดจำหน่ายตัวอย่าง",
    contact: "นายตัวอย่าง ตัวอย่าง",
    email: "supplier@example.com",
    phone: "02-123-4567",
    address: "123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10110",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  movements: {
    product_id: "product_id_placeholder",
    type: "in",
    quantity: 10,
    reason: "รับสินค้าใหม่",
    notes: "สินค้าตัวอย่างสำหรับทดสอบ",
    user_id: "user_id_placeholder",
    user_email: "user@example.com",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },

  users: {
    email: "user@example.com",
    name: "ผู้ใช้ตัวอย่าง",
    role: "user",
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  budgetRequests: {
    title: "คำขอใช้งบประมาณตัวอย่าง",
    description: "คำขอใช้งบประมาณสำหรับซื้อสินค้าตัวอย่าง",
    amount: 5000.00,
    currency: "THB",
    status: "pending",
    requester_email: "requester@example.com",
    requester_name: "ผู้ขอใช้งบประมาณ",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  approvals: {
    request_id: "budget_request_id_placeholder",
    approver_email: "approver@example.com",
    approver_name: "ผู้อนุมัติ",
    status: "pending",
    comments: "รอการอนุมัติ",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  approvers: {
    name: "ผู้อนุมัติตัวอย่าง",
    email: "approver@example.com",
    department: "ฝ่ายบริหาร",
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  requesters: {
    name: "ผู้ขอใช้งบประมาณ",
    email: "requester@example.com",
    department: "ฝ่ายจัดซื้อ",
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  accountCodes: {
    code: "ACC001",
    name: "รหัสบัญชีตัวอย่าง",
    description: "รหัสบัญชีสำหรับทดสอบ",
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  accessCodes: {
    code: "ACCESS001",
    name: "รหัสเข้าถึงตัวอย่าง",
    description: "รหัสเข้าถึงระบบสำหรับทดสอบ",
    is_active: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  },

  approvalLogs: {
    request_id: "budget_request_id_placeholder",
    action: "created",
    user_email: "user@example.com",
    user_name: "ผู้ใช้",
    details: "สร้างคำขอใช้งบประมาณ",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },

  appSettings: {
    company_name: "บริษัทตัวอย่าง จำกัด",
    email: "info@example.com",
    phone: "02-123-4567",
    address: "123 ถนนตัวอย่าง กรุงเทพฯ 10110",
    currency: "THB",
    low_stock_alert: true,
    email_notifications: true,
    auto_backup: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  }
};

async function seedData() {
  try {
    console.log("🌱 เริ่มเพิ่มข้อมูลตัวอย่าง...");

    // เพิ่มข้อมูลในแต่ละ collection
    for (const [collectionName, data] of Object.entries(sampleData)) {
      try {
        const docRef = await db.collection(collectionName).add(data);
        console.log(`✅ เพิ่มข้อมูลใน ${collectionName} สำเร็จ (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูลใน ${collectionName}:`, error);
      }
    }

    // อัปเดต movements และ approvals ให้อ้างอิง ID ที่ถูกต้อง
    console.log("🔗 อัปเดตการอ้างอิง...");
    
    // หา product ID
    const productsSnapshot = await db.collection('products').get();
    if (!productsSnapshot.empty) {
      const productId = productsSnapshot.docs[0].id;
      
      // อัปเดต movements
      const movementsSnapshot = await db.collection('movements').get();
      if (!movementsSnapshot.empty) {
        const movementId = movementsSnapshot.docs[0].id;
        await db.collection('movements').doc(movementId).update({
          product_id: productId
        });
        console.log("✅ อัปเดต movements product_id");
      }
    }

    // หา budget request ID
    const budgetRequestsSnapshot = await db.collection('budgetRequests').get();
    if (!budgetRequestsSnapshot.empty) {
      const budgetRequestId = budgetRequestsSnapshot.docs[0].id;
      
      // อัปเดต approvals
      const approvalsSnapshot = await db.collection('approvals').get();
      if (!approvalsSnapshot.empty) {
        const approvalId = approvalsSnapshot.docs[0].id;
        await db.collection('approvals').doc(approvalId).update({
          request_id: budgetRequestId
        });
        console.log("✅ อัปเดต approvals request_id");
      }

      // อัปเดต approval logs
      const approvalLogsSnapshot = await db.collection('approvalLogs').get();
      if (!approvalLogsSnapshot.empty) {
        const approvalLogId = approvalLogsSnapshot.docs[0].id;
        await db.collection('approvalLogs').doc(approvalLogId).update({
          request_id: budgetRequestId
        });
        console.log("✅ อัปเดต approval logs request_id");
      }
    }

    console.log("🎉 เพิ่มข้อมูลตัวอย่างเสร็จสิ้น!");
    
    // แสดงสรุปข้อมูล
    console.log("\n📊 สรุปข้อมูลที่เพิ่ม:");
    for (const collectionName of Object.keys(sampleData)) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`- ${collectionName}: ${snapshot.size} รายการ`);
    }

  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  } finally {
    process.exit(0);
  }
}

// รัน script
seedData();
