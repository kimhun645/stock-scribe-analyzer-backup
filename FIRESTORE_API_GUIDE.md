# 🔥 Firestore API Guide

## 📋 **API Endpoints ที่พร้อมใช้**

### **Base URL:** `https://stock-scribe-backend-601202807478.asia-southeast1.run.app`

---

## 🔐 **Authentication**

ทุก API endpoint (ยกเว้น `/api/health`) ต้องส่ง Firebase ID Token ใน header:

```javascript
headers: {
  'Authorization': `Bearer ${firebaseIdToken}`,
  'Content-Type': 'application/json'
}
```

---

## 📊 **GET Endpoints (ดึงข้อมูล)**

### 1. **Health Check**
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-08T21:35:10.772Z"
}
```

### 2. **Get All Products**
```http
GET /api/products
```
**Response:**
```json
{
  "products": [
    {
      "id": "product_id_1",
      "name": "Product Name",
      "category": "Category Name",
      "supplier": "Supplier Name",
      "price": 100.50,
      "stock": 50,
      "description": "Product description",
      "createdAt": "2025-01-09T00:00:00.000Z",
      "updatedAt": "2025-01-09T00:00:00.000Z"
    }
  ]
}
```

### 3. **Get All Categories**
```http
GET /api/categories
```
**Response:**
```json
{
  "categories": [
    {
      "id": "category_id_1",
      "name": "Category Name",
      "description": "Category description",
      "createdAt": "2025-01-09T00:00:00.000Z",
      "updatedAt": "2025-01-09T00:00:00.000Z"
    }
  ]
}
```

### 4. **Get All Suppliers**
```http
GET /api/suppliers
```
**Response:**
```json
{
  "suppliers": [
    {
      "id": "supplier_id_1",
      "name": "Supplier Name",
      "contact": "Contact Person",
      "email": "supplier@example.com",
      "phone": "0123456789",
      "address": "Supplier Address",
      "createdAt": "2025-01-09T00:00:00.000Z",
      "updatedAt": "2025-01-09T00:00:00.000Z"
    }
  ]
}
```

### 5. **Get All Stock Movements**
```http
GET /api/stock-movements
```
**Response:**
```json
{
  "movements": [
    {
      "id": "movement_id_1",
      "productId": "product_id_1",
      "type": "in",
      "quantity": 10,
      "reason": "Purchase",
      "notes": "Notes",
      "userId": "user_uid",
      "userEmail": "user@example.com",
      "createdAt": "2025-01-09T00:00:00.000Z"
    }
  ]
}
```

---

## ✏️ **POST Endpoints (เพิ่มข้อมูล)**

### 1. **Add New Product**
```http
POST /api/products
```
**Request Body:**
```json
{
  "name": "Product Name",
  "category": "Category Name",
  "supplier": "Supplier Name",
  "price": 100.50,
  "stock": 50,
  "description": "Product description"
}
```
**Response:**
```json
{
  "message": "Product added successfully",
  "id": "new_product_id"
}
```

### 2. **Add New Category**
```http
POST /api/categories
```
**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description"
}
```
**Response:**
```json
{
  "message": "Category added successfully",
  "id": "new_category_id"
}
```

### 3. **Add New Supplier**
```http
POST /api/suppliers
```
**Request Body:**
```json
{
  "name": "Supplier Name",
  "contact": "Contact Person",
  "email": "supplier@example.com",
  "phone": "0123456789",
  "address": "Supplier Address"
}
```
**Response:**
```json
{
  "message": "Supplier added successfully",
  "id": "new_supplier_id"
}
```

### 4. **Add Stock Movement**
```http
POST /api/stock-movements
```
**Request Body:**
```json
{
  "productId": "product_id_1",
  "type": "in",
  "quantity": 10,
  "reason": "Purchase",
  "notes": "Notes"
}
```
**Response:**
```json
{
  "message": "Stock movement added successfully",
  "id": "new_movement_id"
}
```

---

## 🔧 **Frontend Integration Example**

```javascript
// ใน frontend (React)
import { getAuth } from 'firebase/auth';

const auth = getAuth();

// ฟังก์ชันสำหรับเรียก API
async function callAPI(endpoint, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  const idToken = await user.getIdToken();
  
  const response = await fetch(`https://stock-scribe-backend-601202807478.asia-southeast1.run.app${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// ตัวอย่างการใช้งาน
async function getProducts() {
  try {
    const data = await callAPI('/api/products');
    console.log('Products:', data.products);
    return data.products;
  } catch (error) {
    console.error('Error getting products:', error);
  }
}

async function addProduct(productData) {
  try {
    const result = await callAPI('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    console.log('Product added:', result);
    return result;
  } catch (error) {
    console.error('Error adding product:', error);
  }
}
```

---

## 🗂️ **Firestore Collections Structure**

```
📁 stock-6e930 (Firestore Database)
├── 📄 products
│   ├── 📄 {productId}
│   │   ├── name: string
│   │   ├── category: string
│   │   ├── supplier: string
│   │   ├── price: number
│   │   ├── stock: number
│   │   ├── description: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
├── 📄 categories
│   ├── 📄 {categoryId}
│   │   ├── name: string
│   │   ├── description: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
├── 📄 suppliers
│   ├── 📄 {supplierId}
│   │   ├── name: string
│   │   ├── contact: string
│   │   ├── email: string
│   │   ├── phone: string
│   │   ├── address: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
└── 📄 stock_movements
    ├── 📄 {movementId}
    │   ├── productId: string
    │   ├── type: string ('in' | 'out')
    │   ├── quantity: number
    │   ├── reason: string
    │   ├── notes: string
    │   ├── userId: string
    │   ├── userEmail: string
    │   └── createdAt: timestamp
```

---

## ✅ **Status Codes**

- **200** - Success
- **401** - Unauthorized (ไม่มี Firebase token หรือ token ไม่ถูกต้อง)
- **500** - Internal Server Error

---

## 🚀 **Next Steps**

1. **ทดสอบ API** - ใช้ Postman หรือ curl
2. **เชื่อมต่อ Frontend** - อัปเดต API service ใน frontend
3. **เพิ่ม Validation** - เพิ่มการตรวจสอบข้อมูล
4. **เพิ่ม Error Handling** - จัดการ error ให้ดีขึ้น
5. **เพิ่ม Pagination** - สำหรับข้อมูลจำนวนมาก
