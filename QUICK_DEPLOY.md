# 🚀 Quick Deploy Guide - Stock Scribe Analyzer

## 📋 **การ Deploy แบบง่าย (ไม่ต้องใช้ Docker)**

### **ขั้นตอนที่ 1: ติดตั้ง Tools**

#### **1.1 Google Cloud SDK**
```bash
# ดาวน์โหลดและติดตั้งจาก:
# https://cloud.google.com/sdk/docs/install

# หรือใช้ Chocolatey (Windows)
choco install gcloudsdk

# ตรวจสอบการติดตั้ง
gcloud --version
```

#### **1.2 Firebase CLI**
```bash
# ติดตั้งผ่าน npm
npm install -g firebase-tools

# ตรวจสอบการติดตั้ง
firebase --version

# Login Firebase
firebase login
```

---

### **ขั้นตอนที่ 2: ตั้งค่า Project**

#### **2.1 รัน Setup Script**
```bash
# Windows
setup-project.bat

# หรือทำแบบ Manual:
```

#### **2.2 สร้าง Google Cloud Project**
```bash
# สร้าง project
gcloud projects create stock-scribe-analyzer-2025

# ตั้งค่า project
gcloud config set project stock-scribe-analyzer-2025

# เปิดใช้งาน APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
```

#### **2.3 ตั้งค่า Firebase**
```bash
# Login Firebase
firebase login

# เริ่มต้น Firebase project
firebase init

# เลือก:
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting
```

---

### **ขั้นตอนที่ 3: Deploy ระบบ**

#### **3.1 รัน Deploy Script**
```bash
# Windows
deploy-simple.bat

# หรือทำแบบ Manual:
```

#### **3.2 Deploy Backend**
```bash
# Deploy ไปยัง Google Cloud Run
gcloud run deploy stock-scribe-backend \
    --source . \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3001 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production,PORT=3001
```

#### **3.3 Deploy Frontend**
```bash
# Build frontend
npm run build

# Deploy ไปยัง Firebase Hosting
firebase deploy --only hosting
```

#### **3.4 Deploy Firestore**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

---

### **ขั้นตอนที่ 4: ทดสอบระบบ**

#### **4.1 ทดสอบ Backend**
```bash
# ตรวจสอบ health endpoint
curl https://your-backend-url.run.app/health

# ตรวจสอบ status endpoint
curl https://your-backend-url.run.app/status
```

#### **4.2 ทดสอบ Frontend**
```bash
# เปิดเว็บไซต์
https://your-project.web.app
```

---

## 🎯 **Scripts ที่พร้อมใช้งาน**

### **1. setup-project.bat**
- สร้าง Google Cloud project
- ตั้งค่า Firebase project
- สร้าง service account
- ตั้งค่า environment variables

### **2. deploy-simple.bat**
- Deploy backend ไปยัง Cloud Run
- Deploy frontend ไปยัง Firebase Hosting
- Deploy Firestore rules และ indexes

### **3. npm scripts**
```bash
# Deploy backend
npm run deploy:backend

# Deploy frontend
npm run deploy:frontend

# Deploy Firestore
npm run deploy:firestore

# Deploy ทั้งหมด
npm run deploy:all
```

---

## 🔧 **การแก้ไขปัญหา**

### **1. gcloud ไม่ทำงาน**
```bash
# ตรวจสอบ PATH
echo $PATH

# เพิ่ม PATH สำหรับ Windows
# เพิ่ม C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin
```

### **2. firebase ไม่ทำงาน**
```bash
# ติดตั้งใหม่
npm uninstall -g firebase-tools
npm install -g firebase-tools
```

### **3. Deploy ล้มเหลว**
```bash
# ตรวจสอบ logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# ตรวจสอบ project ID
gcloud config get-value project
```

---

## 📊 **ผลลัพธ์หลัง Deploy**

### **URLs ที่จะได้:**
- **Frontend**: `https://your-project.web.app`
- **Backend**: `https://your-backend-url.run.app`
- **Firebase Console**: `https://console.firebase.google.com/project/your-project-id`
- **Google Cloud Console**: `https://console.cloud.google.com`

### **Features ที่พร้อมใช้งาน:**
- ✅ Frontend (React + TypeScript)
- ✅ Backend (Node.js + Express)
- ✅ Database (Firestore)
- ✅ Authentication (Firebase Auth)
- ✅ Security (Rate Limiting, CORS, Input Validation)
- ✅ Monitoring (Health Checks, Metrics)
- ✅ Caching (Response Caching)

---

## 🎉 **พร้อมใช้งาน!**

หลังจาก deploy เสร็จแล้ว ระบบจะพร้อมใช้งานที่:
- **Frontend**: `https://your-project.web.app`
- **Backend**: `https://your-backend-url.run.app`

---

**หมายเหตุ**: หากต้องการความช่วยเหลือเพิ่มเติม กรุณาตรวจสอบ `DEPLOYMENT_GUIDE.md` สำหรับรายละเอียดเพิ่มเติม
