# 🗄️ การเชื่อมต่อฐานข้อมูลในระบบ Production

## 📋 สรุปการตั้งค่าฐานข้อมูล

ระบบ Stock Scribe Analyzer ใช้ **2 ฐานข้อมูล** ใน production:

### 1. 🗃️ **Firestore (NoSQL)** - ฐานข้อมูลหลัก
- **Project ID**: stock-6e930
- **Database ID**: default
- **Type**: NoSQL Document Database
- **Location**: Multi-region (asia-southeast1)

### 2. 🐘 **PostgreSQL** - ฐานข้อมูลรอง (ถ้ามี)
- **Status**: ไม่ได้ใช้งานใน production ปัจจุบัน
- **Configuration**: Hard-coded ใน server.mjs

---

## 🔥 Firestore Configuration

### Frontend (React):
```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "stock-6e930.firebaseapp.com",
  projectId: "stock-6e930",
  storageBucket: "stock-6e930.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Backend (Node.js):
```javascript
// server-firestore.mjs
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
```

---

## 📊 Firestore Collections

ระบบใช้ collections ต่อไปนี้:

```javascript
export const collections = {
  products: 'products',           // สินค้า
  categories: 'categories',       // หมวดหมู่
  suppliers: 'suppliers',         // ผู้จัดจำหน่าย
  movements: 'movements',         // การเคลื่อนไหวสต็อก
  users: 'users',                // ผู้ใช้งาน
  budgetRequests: 'budgetRequests', // คำของบประมาณ
  approvals: 'approvals',        // การอนุมัติ
  approvers: 'approvers',        // ผู้อนุมัติ
  requesters: 'requesters',      // ผู้ขอ
  accountCodes: 'accountCodes'   // รหัสบัญชี
};
```

---

## 🔧 Environment Variables

### Production Environment:
```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyB...
FIREBASE_AUTH_DOMAIN=stock-6e930.firebaseapp.com
FIREBASE_PROJECT_ID=stock-6e930
FIREBASE_STORAGE_BUCKET=stock-6e930.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Server Configuration
NODE_ENV=production
CORS_ORIGIN=https://stock-6e930.web.app,https://stock-6e930.firebaseapp.com
JWT_SECRET=your-jwt-secret-key
```

---

## 🚀 การเชื่อมต่อใน Production

### 1. **Frontend → Firestore**:
- เชื่อมต่อผ่าน Firebase SDK
- ใช้ Firebase Authentication
- Real-time updates

### 2. **Backend → Firestore**:
- เชื่อมต่อผ่าน Firebase Admin SDK
- Server-side operations
- Batch operations

### 3. **Authentication**:
- Firebase Authentication
- JWT tokens
- User management

---

## 📈 การจัดการข้อมูล

### Firestore Service Functions:
```typescript
export class FirestoreService {
  // CRUD Operations
  static async create(collection: string, data: any)
  static async read(collection: string, id: string)
  static async update(collection: string, id: string, data: any)
  static async delete(collection: string, id: string)
  
  // Batch Operations
  static async batchCreate(collection: string, dataArray: any[])
  static async batchUpdate(collection: string, updates: any[])
  
  // Query Operations
  static async query(collection: string, conditions: any[])
  static async paginate(collection: string, limit: number, startAfter?: any)
}
```

---

## 🔐 Security Rules

### Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'manager'];
    }
    
    // Categories are readable by all authenticated users
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

---

## 📊 การ Monitor และ Logging

### 1. **Firebase Console**:
- URL: https://console.firebase.google.com/project/stock-6e930
- Firestore Database
- Authentication
- Usage Analytics

### 2. **Google Cloud Console**:
- URL: https://console.cloud.google.com/firestore
- Database monitoring
- Performance metrics
- Cost analysis

### 3. **Application Logs**:
```javascript
// Logging in production
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in Production mode");
  // API request log → api.log
  // Error log → error.log
}
```

---

## 🔄 การ Backup และ Recovery

### 1. **Firestore Backup**:
- Automatic daily backups
- Point-in-time recovery
- Export/Import functionality

### 2. **Data Export**:
```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/backup-$(date +%Y%m%d)
```

### 3. **Data Import**:
```bash
# Import Firestore data
gcloud firestore import gs://your-backup-bucket/backup-20240908
```

---

## 🛠️ การ Troubleshooting

### 1. **Connection Issues**:
```bash
# Test Firebase connection
firebase projects:list
firebase use stock-6e930
firebase firestore:indexes
```

### 2. **Authentication Issues**:
```bash
# Check Firebase Auth
firebase auth:export users.json
firebase auth:import users.json
```

### 3. **Performance Issues**:
- Monitor Firestore usage
- Check query performance
- Optimize indexes

---

## 📋 สรุป

### ✅ **ฐานข้อมูลที่ใช้งาน**:
- **Firestore**: ฐานข้อมูลหลัก (NoSQL)
- **Firebase Auth**: การจัดการผู้ใช้
- **PostgreSQL**: ไม่ได้ใช้งานใน production

### ✅ **การเชื่อมต่อ**:
- **Frontend**: Firebase SDK
- **Backend**: Firebase Admin SDK
- **Security**: Firestore Security Rules

### ✅ **การ Monitor**:
- **Firebase Console**: จัดการฐานข้อมูล
- **Google Cloud Console**: Monitor และ Analytics
- **Application Logs**: Error tracking

### 🎯 **สถานะปัจจุบัน**:
ระบบใช้ **Firestore** เป็นฐานข้อมูลหลักใน production และทำงานได้ปกติ!

---

**Last Updated**: $(date)
**Status**: ✅ Production Ready
**Database**: Firestore (stock-6e930)
