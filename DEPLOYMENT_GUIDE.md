# 🚀 Deployment Guide - Stock Scribe Analyzer

## 📋 **ภาพรวมการ Deploy**

ระบบ Stock Scribe Analyzer จะถูก deploy ไปยัง:
- **Frontend**: Firebase Hosting
- **Backend**: Google Cloud Run
- **Database**: Firestore
- **Container**: Docker

---

## 🛠️ **Prerequisites**

### **1. ติดตั้ง Tools ที่จำเป็น**
```bash
# Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Firebase CLI
npm install -g firebase-tools

# Docker
# ติดตั้ง Docker Desktop จาก https://www.docker.com/products/docker-desktop
```

### **2. ตั้งค่า Google Cloud Project**
```bash
# สร้าง project ใหม่
gcloud projects create your-project-id

# ตั้งค่า project
gcloud config set project your-project-id

# เปิดใช้งาน APIs ที่จำเป็น
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
```

### **3. ตั้งค่า Firebase Project**
```bash
# Login Firebase
firebase login

# เริ่มต้น Firebase project
firebase init

# เลือก:
# - Firestore
# - Hosting
# - Functions (optional)
```

---

## 🔧 **การตั้งค่า Environment**

### **1. สร้างไฟล์ credentials.json**
```bash
# สร้าง service account
gcloud iam service-accounts create stock-scribe-service

# กำหนด roles
gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:stock-scribe-service@your-project-id.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# สร้าง key
gcloud iam service-accounts keys create credentials.json \
    --iam-account=stock-scribe-service@your-project-id.iam.gserviceaccount.com
```

### **2. ตั้งค่า Environment Variables**
```bash
# ใน Google Cloud Console
# ไปที่ Cloud Run > stock-scribe-backend > Edit & Deploy New Revision
# เพิ่ม environment variables:

NODE_ENV=production
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
JWT_SECRET=your-super-secret-jwt-key
REFRESH_SECRET=your-super-secret-refresh-key
CORS_ORIGIN=https://your-project.web.app
```

---

## 🚀 **การ Deploy**

### **1. Deploy อัตโนมัติ (แนะนำ)**
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### **2. Deploy แบบ Manual**

#### **Backend (Google Cloud Run)**
```bash
# Build Docker image
docker build -t gcr.io/your-project-id/stock-scribe-backend:latest -f Dockerfile.production .

# Push to Container Registry
docker push gcr.io/your-project-id/stock-scribe-backend:latest

# Deploy to Cloud Run
gcloud run deploy stock-scribe-backend \
    --image gcr.io/your-project-id/stock-scribe-backend:latest \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3001 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10
```

#### **Frontend (Firebase Hosting)**
```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### **Firestore (Rules & Indexes)**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

---

## 🧪 **การทดสอบ**

### **1. ทดสอบ Backend**
```bash
# ตรวจสอบ health endpoint
curl https://your-backend-url.run.app/health

# ตรวจสอบ status endpoint
curl https://your-backend-url.run.app/status

# ตรวจสอบ metrics endpoint
curl https://your-backend-url.run.app/metrics
```

### **2. ทดสอบ Frontend**
```bash
# เปิดเว็บไซต์
https://your-project.web.app

# ตรวจสอบ console สำหรับ errors
# ตรวจสอบ network requests
```

### **3. ทดสอบ Firestore**
```bash
# เปิด Firebase Console
https://console.firebase.google.com/project/your-project-id/firestore

# ตรวจสอบ collections
# ตรวจสอบ security rules
```

---

## 🔒 **Security Configuration**

### **1. Firestore Security Rules**
```javascript
// ตรวจสอบไฟล์ firestore.rules
// ปรับแต่งตามความต้องการของระบบ
```

### **2. CORS Configuration**
```javascript
// ใน server.mjs
const corsOrigins = [
  'https://your-project.web.app',
  'https://your-project.firebaseapp.com'
];
```

### **3. Environment Variables**
```bash
# ตั้งค่า secrets ใน Google Cloud Console
# ไปที่ Secret Manager
# สร้าง secrets สำหรับ:
# - JWT_SECRET
# - REFRESH_SECRET
# - FIREBASE_PROJECT_ID
```

---

## 📊 **Monitoring & Logging**

### **1. Google Cloud Logging**
```bash
# ดู logs ของ Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# ดู logs ของ Firestore
gcloud logging read "resource.type=firestore_database" --limit=50
```

### **2. Firebase Analytics**
```bash
# เปิด Firebase Console
# ไปที่ Analytics
# ตรวจสอบ user activity
```

### **3. Performance Monitoring**
```bash
# เปิด Firebase Console
# ไปที่ Performance
# ตรวจสอบ app performance
```

---

## 🔄 **การอัพเดต**

### **1. อัพเดต Backend**
```bash
# Build image ใหม่
docker build -t gcr.io/your-project-id/stock-scribe-backend:latest -f Dockerfile.production .

# Push image ใหม่
docker push gcr.io/your-project-id/stock-scribe-backend:latest

# Deploy ใหม่
gcloud run deploy stock-scribe-backend \
    --image gcr.io/your-project-id/stock-scribe-backend:latest \
    --region asia-southeast1
```

### **2. อัพเดต Frontend**
```bash
# Build frontend ใหม่
npm run build

# Deploy ใหม่
firebase deploy --only hosting
```

### **3. อัพเดต Firestore Rules**
```bash
# Deploy rules ใหม่
firebase deploy --only firestore:rules
```

---

## 🆘 **Troubleshooting**

### **1. Backend ไม่ทำงาน**
```bash
# ตรวจสอบ logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# ตรวจสอบ service status
gcloud run services describe stock-scribe-backend --region=asia-southeast1
```

### **2. Frontend ไม่โหลด**
```bash
# ตรวจสอบ Firebase Hosting
firebase hosting:channel:list

# ตรวจสอบ build
npm run build
```

### **3. Firestore ไม่เชื่อมต่อ**
```bash
# ตรวจสอบ credentials
gcloud auth application-default print-access-token

# ตรวจสอบ project ID
gcloud config get-value project
```

---

## 📝 **Checklist**

### **ก่อน Deploy**
- [ ] ติดตั้ง Google Cloud SDK
- [ ] ติดตั้ง Firebase CLI
- [ ] ติดตั้ง Docker
- [ ] สร้าง Google Cloud Project
- [ ] ตั้งค่า Firebase Project
- [ ] สร้าง service account
- [ ] ตั้งค่า environment variables

### **หลัง Deploy**
- [ ] ทดสอบ Backend endpoints
- [ ] ทดสอบ Frontend
- [ ] ทดสอบ Firestore
- [ ] ตรวจสอบ security rules
- [ ] ตั้งค่า monitoring
- [ ] ทดสอบ performance

---

## 🔗 **URLs ที่สำคัญ**

- **Frontend**: `https://your-project.web.app`
- **Backend**: `https://your-backend-url.run.app`
- **Firebase Console**: `https://console.firebase.google.com/project/your-project-id`
- **Google Cloud Console**: `https://console.cloud.google.com`

---

**วันที่สร้าง**: 8 กันยายน 2025  
**เวอร์ชัน**: 1.0.0  
**สถานะ**: ✅ พร้อมใช้งาน
