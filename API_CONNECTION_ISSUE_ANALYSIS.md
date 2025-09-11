# 🔍 การวิเคราะห์ปัญหา API Connection Timeout

## ❌ **ปัญหาที่พบ:**

### **Error Messages:**
```
Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
:3001/api/movements:1
:3001/api/categories:1  
:3001/api/suppliers:1
:3001/api/budget-requests:1
```

### **Backend Status:**
- **Health Check**: 500 Internal Server Error
- **Firestore Connection**: Timeout issues
- **API Endpoints**: ไม่สามารถเข้าถึงได้

---

## 🔍 **สาเหตุของปัญหา:**

### 1. **Database Configuration Mismatch:**
- **Backend**: ใช้ PostgreSQL (hard-coded)
- **Production**: ควรใช้ Firestore
- **Connection**: ไม่สามารถเชื่อมต่อ Firestore ได้

### 2. **Firestore Connection Issues:**
```
@firebase/firestore: GrpcConnection RPC 'Listen' stream error. 
Code: 1 Message: 1 CANCELLED: Disconnecting idle stream. 
Timed out waiting for new targets.
```

### 3. **Environment Variables:**
- **Missing**: Firebase configuration ใน production
- **Incorrect**: Database connection settings

---

## ✅ **การแก้ไขที่ทำ:**

### 1. **สร้าง Firestore Backend:**
- **ไฟล์ใหม่**: `server-firestore-production.mjs`
- **Database**: เปลี่ยนจาก PostgreSQL เป็น Firestore
- **Configuration**: ใช้ Firebase config จริง

### 2. **อัปเดต Dockerfile:**
```dockerfile
COPY --from=builder /app/server-firestore-production.mjs ./server.mjs
```

### 3. **Deploy ใหม่:**
- **Revision**: stock-scribe-backend-00009-zqg
- **Status**: Deployed successfully
- **URL**: https://stock-scribe-backend-601202807478.asia-southeast1.run.app

---

## 🔧 **การตั้งค่า Firestore Backend:**

### **Firebase Configuration:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCsXLEXI4e_3hoK_Aef6EIOwygxTJGtLek",
  authDomain: "stock-6e930.firebaseapp.com",
  projectId: "stock-6e930",
  storageBucket: "stock-6e930.firebasestorage.app",
  messagingSenderId: "1067364434675",
  appId: "1:1067364434675:web:453eed567f011715586d86"
};
```

### **API Endpoints ที่รองรับ:**
- ✅ `/api/health` - Health check
- ✅ `/api/status` - Service status
- ✅ `/api/products` - Product management
- ✅ `/api/categories` - Category management
- ✅ `/api/suppliers` - Supplier management
- ✅ `/api/movements` - Stock movements
- ✅ `/api/budget-requests` - Budget requests
- ✅ `/api/settings` - System settings

---

## 🚀 **สถานะปัจจุบัน:**

### **Backend:**
- **Status**: Deployed (Revision 00009-zqg)
- **Database**: Firestore (stock-6e930)
- **Health**: ยังมีปัญหา 500 error

### **Frontend:**
- **Status**: ✅ Working (https://stock-6e930.web.app)
- **Login**: ✅ Working with Firebase Auth
- **API Calls**: ❌ Connection timeout

---

## 🔄 **ขั้นตอนต่อไป:**

### 1. **ตรวจสอบ Firestore Permissions:**
```bash
# ตรวจสอบ Firestore rules
firebase firestore:rules:get
```

### 2. **ทดสอบ Firestore Connection:**
```bash
# ทดสอบการเชื่อมต่อ
firebase firestore:indexes
```

### 3. **ตรวจสอบ Environment Variables:**
```bash
# ตรวจสอบ environment ใน Cloud Run
gcloud run services describe stock-scribe-backend --region=asia-southeast1
```

### 4. **สร้าง Firestore Collections:**
```javascript
// Collections ที่ต้องมี:
- products
- categories  
- suppliers
- movements
- budgetRequests
- settings
- health
```

---

## 🛠️ **วิธีแก้ไขเพิ่มเติม:**

### **Option 1: ใช้ Firebase Admin SDK**
```javascript
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  projectId: 'stock-6e930'
});
const db = getFirestore(app);
```

### **Option 2: ใช้ Service Account**
```javascript
// ใช้ service account key
const serviceAccount = require('./service-account-key.json');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'stock-6e930'
});
```

### **Option 3: ใช้ Environment Variables**
```bash
# ตั้งค่า environment variables
FIREBASE_PROJECT_ID=stock-6e930
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 📊 **สรุป:**

### **ปัญหา:**
- Backend ใช้ PostgreSQL แทน Firestore
- Firestore connection timeout
- API endpoints ไม่ทำงาน

### **การแก้ไข:**
- ✅ สร้าง Firestore backend
- ✅ Deploy ใหม่
- ⏳ ยังต้องแก้ไข connection issues

### **สถานะ:**
- **Frontend**: ✅ ทำงานปกติ
- **Backend**: ⚠️ Deployed แต่ยังมีปัญหา
- **Database**: 🔄 กำลังเปลี่ยนเป็น Firestore

---

**อัปเดตเมื่อ**: $(date)
**สถานะ**: 🔄 กำลังแก้ไข
**ปัญหา**: API Connection Timeout
