# Firebase Hosting Deploy Guide

## 🚀 วิธี Deploy ไป Firebase Hosting

### 1. ตรวจสอบการตั้งค่า

**ไฟล์ที่สำคัญ:**
- ✅ `firebase.json` - การตั้งค่า Firebase Hosting
- ✅ `dist/` - ไฟล์ที่ build แล้ว
- ✅ Firebase project: `stock-6e930`

### 2. ขั้นตอนการ Deploy

#### วิธีที่ 1: ใช้ Firebase CLI (แนะนำ)

```bash
# 1. ตรวจสอบการล็อกอิน
firebase login

# 2. เลือก project
firebase use stock-6e930

# 3. Build frontend
npm run build

# 4. Deploy
firebase deploy --only hosting
```

#### วิธีที่ 2: ใช้ npm script

```bash
# Deploy frontend
npm run deploy:frontend
```

### 3. การตั้งค่า Firebase Console

1. ไปที่ [Firebase Console](https://console.firebase.google.com/u/0/project/stock-6e930/hosting/sites/stock-6e930)
2. เลือก **Hosting** ในเมนูซ้าย
3. คลิก **Get started** (ถ้ายังไม่ได้ตั้งค่า)
4. เลือก **Use an existing site** หรือ **Create new site**

### 4. การตั้งค่า Custom Domain (ถ้าต้องการ)

1. ใน Firebase Console > Hosting
2. คลิก **Add custom domain**
3. กรอก domain name ที่ต้องการ
4. ตั้งค่า DNS records ตามที่ Firebase แนะนำ

### 5. การตั้งค่า Environment Variables

สำหรับ production, ตรวจสอบว่า:

```javascript
// src/lib/firebase-config.ts
export const firebaseConfig = {
  apiKey: "AIzaSyCsXLEXI4e_3hoK_Aef6EIOwygxTJGtLek",
  authDomain: "stock-6e930.firebaseapp.com",
  projectId: "stock-6e930",
  storageBucket: "stock-6e930.firebasestorage.app",
  messagingSenderId: "1067364434675",
  appId: "1:1067364434675:web:453eed567f011715586d86"
};
```

### 6. การตั้งค่า Backend API

ใน `firebase.json` มีการตั้งค่า rewrite สำหรับ API:

```json
{
  "rewrites": [
    {
      "source": "/api/**",
      "destination": "https://stock-scribe-backend-601202807478.asia-southeast1.run.app/api/**"
    }
  ]
}
```

### 7. การทดสอบหลัง Deploy

1. เปิด URL ที่ Firebase ให้มา
2. ทดสอบการล็อกอินด้วย Firebase Authentication
3. ทดสอบการเรียก API
4. ตรวจสอบทุกเมนูในระบบ

### 8. Troubleshooting

#### ปัญหาที่อาจเกิดขึ้น:

1. **Deploy ล้มเหลว**
   ```bash
   # ตรวจสอบการล็อกอิน
   firebase login --reauth
   
   # ตรวจสอบ project
   firebase projects:list
   ```

2. **ไฟล์ไม่ถูก deploy**
   ```bash
   # ตรวจสอบไฟล์ใน dist/
   ls -la dist/
   
   # Build ใหม่
   npm run build
   ```

3. **API ไม่ทำงาน**
   - ตรวจสอบ CORS settings ใน backend
   - ตรวจสอบ Firebase ID Token

### 9. การอัปเดต

```bash
# อัปเดต frontend
npm run build
firebase deploy --only hosting

# อัปเดต backend
npm run deploy:backend
```

### 10. การ Monitor

1. ไปที่ Firebase Console > Hosting
2. ดู **Usage** และ **Performance**
3. ตรวจสอบ **Logs** หากมีปัญหา

## 📋 Checklist การ Deploy

- [ ] Firebase CLI ติดตั้งแล้ว
- [ ] ล็อกอิน Firebase แล้ว
- [ ] เลือก project `stock-6e930`
- [ ] Build frontend สำเร็จ
- [ ] Deploy สำเร็จ
- [ ] ทดสอบการทำงาน
- [ ] ตั้งค่า custom domain (ถ้าต้องการ)

## 🎯 URL หลัง Deploy

หลัง deploy สำเร็จ คุณจะได้ URL:
- **Default URL**: `https://stock-6e930.web.app`
- **Custom Domain**: (ถ้าตั้งค่าแล้ว)

## 🔧 Commands ที่ใช้บ่อย

```bash
# Deploy frontend
firebase deploy --only hosting

# Deploy backend
npm run deploy:backend

# Deploy ทั้งหมด
npm run deploy:all

# ดู status
firebase hosting:channel:list
```
