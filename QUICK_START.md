# 🚀 Quick Start Guide - Stock Scribe Analyzer

## 📋 **การเริ่มต้นใช้งาน**

### **1. ติดตั้ง Dependencies**
```bash
npm install
```

### **2. เริ่มเซิร์ฟเวอร์**
```bash
# Development mode
npm run dev:server

# Production mode with UTF-8
npm run start:utf8

# Production mode
npm run start
```

### **3. ทดสอบระบบ**
```bash
# ทดสอบ UTF-8 encoding
npm run test:utf8

# ทดสอบ monitoring endpoints
curl http://localhost:3001/status
curl http://localhost:3001/health
curl http://localhost:3001/metrics
```

### **4. เปิดเว็บไซต์**
```
http://localhost:3001
```

---

## 🔧 **การตั้งค่าฐานข้อมูล**

### **รัน Database Optimization**
```bash
psql -h 127.0.0.1 -U postgres -d stocknrs -f database-optimization.sql
```

### **ตรวจสอบฐานข้อมูล**
```bash
psql -h 127.0.0.1 -U postgres -d stocknrs -c "\dt"
```

---

## 📊 **Monitoring Endpoints**

- **`GET /status`** - สถานะระบบพื้นฐาน
- **`GET /health`** - ตรวจสอบสุขภาพระบบและฐานข้อมูล
- **`GET /metrics`** - แสดงเมตริกส์และสถิติระบบ

---

## 🛡️ **Security Features**

- ✅ Rate Limiting (100 req/15min)
- ✅ Security Headers (Helmet.js)
- ✅ Input Validation (Zod)
- ✅ SQL Injection Protection
- ✅ CORS Configuration

---

## ⚡ **Performance Features**

- ✅ Database Indexes
- ✅ Query Caching
- ✅ Response Caching
- ✅ Database Views
- ✅ Automatic Triggers

---

## 🌐 **UTF-8 Support**

- ✅ Thai Language Support
- ✅ Proper Encoding Configuration
- ✅ Database UTF-8 Setup
- ✅ Testing Scripts

---

## 📁 **ไฟล์สำคัญ**

- `server.mjs` - Main server file
- `security-middleware.js` - Security configurations
- `monitoring.js` - Monitoring and logging
- `caching.js` - Caching system
- `database-optimization.sql` - Database performance scripts
- `test-utf8-encoding.js` - UTF-8 testing script

---

## 🆘 **Troubleshooting**

### **Port 3001 ถูกใช้งาน**
```bash
taskkill /f /im node.exe
```

### **ฐานข้อมูลไม่เชื่อมต่อ**
```bash
# ตรวจสอบ PostgreSQL
psql -h 127.0.0.1 -U postgres -d stocknrs -c "SELECT version();"
```

### **UTF-8 ไม่ทำงาน**
```bash
npm run test:utf8
```

---

## 📞 **Support**

หากมีปัญหาการใช้งาน กรุณาตรวจสอบ:
1. `SYSTEM_IMPROVEMENTS_SUMMARY.md` - สรุปการปรับปรุงระบบ
2. `UTF8-SETUP.md` - การตั้งค่า UTF-8
3. `PROJECT_STATUS.md` - สถานะโปรเจค

---

**เวอร์ชัน**: 1.0.0  
**อัพเดตล่าสุด**: 8 กันยายน 2025
