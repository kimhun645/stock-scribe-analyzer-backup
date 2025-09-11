# 🚀 Stock Scribe Analyzer

## 📋 Overview
ระบบจัดการสต็อกสินค้าอัจฉริยะ พร้อมระบบอนุมัติงบประมาณและรายงาน

## 🏗️ Project Structure
```
stock-scribe-analyzer/
├── dev/                 # Development Environment
│   ├── src/            # Frontend source code
│   ├── server-dev.js   # Mock API server
│   ├── run-dev.bat     # Windows run script
│   ├── run-dev.sh      # Linux/Mac run script
│   └── README.md       # Development guide
├── prod/               # Production Environment
│   ├── src/            # Frontend source code
│   ├── server-prod.js  # Firebase production server
│   ├── run-prod.bat    # Windows run script
│   ├── run-prod.sh     # Linux/Mac run script
│   └── README.md       # Production guide
└── README.md           # This file
```

## 🚀 Quick Start

### Development Environment
```bash
# เข้าไปยัง dev folder
cd dev

# รัน development environment
# Windows
run-dev.bat

# Linux/Mac
chmod +x run-dev.sh
./run-dev.sh
```

### Production Environment
```bash
# เข้าไปยัง prod folder
cd prod

# รัน production environment
# Windows
run-prod.bat

# Linux/Mac
chmod +x run-prod.sh
./run-prod.sh
```

## 🛠️ Features

### Frontend
- **React 18** + **TypeScript**
- **Vite** สำหรับ fast development
- **Tailwind CSS** สำหรับ styling
- **Radix UI** สำหรับ components
- **React Router** สำหรับ navigation
- **React Hook Form** สำหรับ forms
- **Recharts** สำหรับ charts
- **Lucide React** สำหรับ icons

### Backend
- **Express.js** สำหรับ API server
- **Firebase Admin SDK** สำหรับ production
- **Mock API** สำหรับ development
- **CORS** support
- **Error handling**

### Database
- **Firebase Firestore** สำหรับ production
- **Mock data** สำหรับ development

## 📱 URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

### Production
- **Production Server**: http://localhost:8080
- **Firebase Hosting**: https://stock-6e930.web.app
- **Health Check**: http://localhost:8080/api/health

## 🔧 API Endpoints

### Development (Mock Data)
- `GET /api/products` - ข้อมูลสินค้าตัวอย่าง
- `GET /api/categories` - หมวดหมู่สินค้าตัวอย่าง
- `GET /api/suppliers` - ผู้จัดจำหน่ายตัวอย่าง
- `GET /api/stock-movements` - การเคลื่อนไหวสต็อกตัวอย่าง
- `GET /api/budget-requests` - คำของบประมาณตัวอย่าง
- `GET /api/account-codes` - รหัสบัญชีตัวอย่าง
- `GET /api/requesters` - ผู้ขอตัวอย่าง
- `GET /api/approvers` - ผู้อนุมัติตัวอย่าง
- `GET /api/approvals` - การอนุมัติตัวอย่าง
- `GET /api/settings` - ตั้งค่าระบบตัวอย่าง

### Production (Firebase Firestore)
- `GET /api/products` - ข้อมูลสินค้าจาก Firestore
- `GET /api/categories` - หมวดหมู่สินค้าจาก Firestore
- `GET /api/suppliers` - ผู้จัดจำหน่ายจาก Firestore
- `GET /api/stock-movements` - การเคลื่อนไหวสต็อกจาก Firestore
- `GET /api/budget-requests` - คำของบประมาณจาก Firestore
- `GET /api/account-codes` - รหัสบัญชีจาก Firestore
- `GET /api/requesters` - ผู้ขอจาก Firestore
- `GET /api/approvers` - ผู้อนุมัติจาก Firestore
- `GET /api/approvals` - การอนุมัติจาก Firestore
- `GET /api/settings` - ตั้งค่าระบบจาก Firestore

## 🔥 Firebase Configuration

### Project Details
- **Project ID**: stock-6e930
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting

### Environment Variables
```bash
FIREBASE_PROJECT_ID=stock-6e930
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
```

## 📦 Scripts

### Development
```bash
cd dev
npm run dev              # รัน frontend development server
npm run start            # รัน backend server
npm run start:all        # รันทั้ง frontend และ backend
npm run build            # build สำหรับ development
npm run preview          # preview build
npm run lint             # ตรวจสอบ code quality
npm run type-check       # ตรวจสอบ TypeScript
```

### Production
```bash
cd prod
npm run build:prod       # build สำหรับ production
npm run start:prod       # รัน production server
npm run deploy           # deploy ไปยัง Firebase Hosting
npm run deploy:preview   # deploy preview channel
npm run clean            # ลบ dist folder
```

## 🚀 Deployment

### Firebase Hosting
```bash
cd prod
npm run deploy
```

### Preview Channel
```bash
cd prod
npm run deploy:preview
```

## 📁 File Structure

### Development
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Mock API
- **Hot Reload**: เปิดใช้งาน
- **Source Maps**: เปิดใช้งาน
- **Console Logs**: เปิดใช้งาน

### Production
- **Frontend**: React + TypeScript + Vite (Optimized)
- **Backend**: Express.js + Firebase Admin SDK
- **Hot Reload**: ปิดใช้งาน
- **Source Maps**: ปิดใช้งาน
- **Console Logs**: ปิดใช้งาน
- **Code Splitting**: เปิดใช้งาน
- **Tree Shaking**: เปิดใช้งาน
- **Minification**: เปิดใช้งาน

## 🔧 Configuration

### Development
- **Port**: Frontend (3000), Backend (8080)
- **CORS**: เปิดใช้งานสำหรับ localhost
- **Mock Data**: ข้อมูลตัวอย่างพร้อมใช้งาน
- **Hot Reload**: เปิดใช้งานสำหรับ development

### Production
- **Port**: 8080
- **Environment**: production
- **Firebase Project**: stock-6e930
- **CORS**: เปิดใช้งานสำหรับ production domains
- **Optimization**: เปิดใช้งานสำหรับ production

## 📞 Support
สำหรับคำถามหรือปัญหาการใช้งาน กรุณาติดต่อทีมพัฒนา