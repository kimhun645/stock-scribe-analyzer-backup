# 🛠️ คู่มือการติดตั้ง Tools สำหรับ Deploy

## 📋 **Tools ที่จำเป็น**

### **1. Google Cloud SDK**
```bash
# Windows (PowerShell)
# ดาวน์โหลดและติดตั้งจาก: https://cloud.google.com/sdk/docs/install

# หรือใช้ Chocolatey
choco install gcloudsdk

# หรือใช้ Scoop
scoop install gcloud

# ตรวจสอบการติดตั้ง
gcloud --version
```

### **2. Firebase CLI**
```bash
# ติดตั้งผ่าน npm
npm install -g firebase-tools

# ตรวจสอบการติดตั้ง
firebase --version

# Login Firebase
firebase login
```

### **3. Docker Desktop**
```bash
# ดาวน์โหลดและติดตั้งจาก: https://www.docker.com/products/docker-desktop

# ตรวจสอบการติดตั้ง
docker --version
docker-compose --version
```

---

## 🔧 **การตั้งค่า Google Cloud**

### **1. สร้าง Project**
```bash
# สร้าง project ใหม่
gcloud projects create stock-scribe-analyzer-2025

# ตั้งค่า project
gcloud config set project stock-scribe-analyzer-2025

# เปิดใช้งาน APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
```

### **2. ตั้งค่า Authentication**
```bash
# Login Google Cloud
gcloud auth login

# ตั้งค่า application default credentials
gcloud auth application-default login
```

---

## 🔥 **การตั้งค่า Firebase**

### **1. สร้าง Firebase Project**
```bash
# Login Firebase
firebase login

# เริ่มต้น Firebase project
firebase init

# เลือก:
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting
# - Functions: Configure a Cloud Functions directory (optional)
```

### **2. ตั้งค่า Project ID**
```bash
# ตั้งค่า project ID
firebase use --add

# เลือก project ที่สร้างไว้
```

---

## 🐳 **การตั้งค่า Docker**

### **1. เริ่ม Docker Desktop**
- เปิด Docker Desktop
- รอให้ Docker เริ่มทำงาน
- ตรวจสอบว่า Docker ทำงานปกติ

### **2. ตั้งค่า Docker Hub (Optional)**
```bash
# Login Docker Hub
docker login
```

---

## ✅ **ตรวจสอบการติดตั้ง**

### **1. ตรวจสอบ Tools**
```bash
# ตรวจสอบ Google Cloud SDK
gcloud --version

# ตรวจสอบ Firebase CLI
firebase --version

# ตรวจสอบ Docker
docker --version
docker-compose --version
```

### **2. ตรวจสอบ Authentication**
```bash
# ตรวจสอบ Google Cloud authentication
gcloud auth list

# ตรวจสอบ Firebase authentication
firebase projects:list
```

---

## 🚀 **พร้อม Deploy**

หลังจากติดตั้ง tools ทั้งหมดแล้ว คุณสามารถ:

1. **รัน Deploy Script**
   ```bash
   # Windows
   deploy.bat
   
   # Linux/Mac
   ./deploy.sh
   ```

2. **หรือ Deploy แบบ Manual**
   ```bash
   # Backend
   npm run deploy:backend
   
   # Frontend
   npm run deploy:frontend
   
   # Firestore
   npm run deploy:firestore
   ```

---

## 🆘 **Troubleshooting**

### **1. Google Cloud SDK ไม่ทำงาน**
```bash
# ตรวจสอบ PATH
echo $PATH

# เพิ่ม PATH สำหรับ Windows
# เพิ่ม C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin
```

### **2. Firebase CLI ไม่ทำงาน**
```bash
# ติดตั้งใหม่
npm uninstall -g firebase-tools
npm install -g firebase-tools
```

### **3. Docker ไม่ทำงาน**
- ตรวจสอบว่า Docker Desktop เปิดอยู่
- ตรวจสอบว่า Docker service ทำงาน
- Restart Docker Desktop

---

**หมายเหตุ**: หลังจากติดตั้ง tools ทั้งหมดแล้ว ให้รัน `deploy.bat` เพื่อเริ่มการ deploy
