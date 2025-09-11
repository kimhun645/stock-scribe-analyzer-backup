# 🔥 Firebase Authentication Setup Guide

## 📋 การตั้งค่า Firebase Authentication

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Create a project" หรือ "Add project"
3. ตั้งชื่อโปรเจค เช่น "stock-scribe-analyzer"
4. เลือก Google Analytics (optional)
5. คลิก "Create project"

### 2. เปิดใช้งาน Authentication

1. ใน Firebase Console ไปที่ "Authentication"
2. คลิก "Get started"
3. ไปที่แท็บ "Sign-in method"
4. เปิดใช้งาน "Email/Password" provider
5. คลิก "Save"

### 3. ตั้งค่า Web App

1. ใน Firebase Console ไปที่ "Project settings" (⚙️)
2. เลื่อนลงไปที่ "Your apps" section
3. คลิก "Add app" และเลือก "Web" (</>)
4. ตั้งชื่อ app เช่น "stock-scribe-web"
5. คลิก "Register app"
6. คัดลอก Firebase configuration object

### 4. อัปเดต Firebase Configuration

แก้ไขไฟล์ `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:your-app-id"
};
```

### 5. ตั้งค่า Firestore Database (Optional)

1. ใน Firebase Console ไปที่ "Firestore Database"
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับ development)
4. เลือก location ที่ใกล้ที่สุด
5. คลิก "Done"

### 6. ตั้งค่า Firebase Emulators (สำหรับ Development)

1. ติดตั้ง Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login Firebase:
```bash
firebase login
```

3. Initialize Firebase ในโปรเจค:
```bash
firebase init
```

4. เลือก:
   - Authentication
   - Firestore
   - Emulators

5. ตั้งค่า emulator ports:
   - Authentication: 9099
   - Firestore: 8080

### 7. รัน Firebase Emulators

```bash
firebase emulators:start
```

### 8. ทดสอบการทำงาน

1. เปิดเบราว์เซอร์ไปที่ http://localhost:3000
2. คลิก "Don't have an account? Sign up"
3. สร้างบัญชีใหม่ด้วย email และ password
4. ทดสอบการ login

## 🔧 การแก้ไขปัญหา

### ปัญหา: Firebase emulators ไม่ทำงาน
**วิธีแก้:**
```bash
# หยุด emulators
firebase emulators:stop

# เริ่มใหม่
firebase emulators:start
```

### ปัญหา: Authentication ไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบ Firebase configuration
2. ตรวจสอบว่า Authentication provider เปิดใช้งานแล้ว
3. ตรวจสอบ console สำหรับ error messages

### ปัญหา: CORS errors
**วิธีแก้:**
1. เพิ่ม domain ใน Firebase Console → Authentication → Settings → Authorized domains
2. เพิ่ม localhost:3000 และ localhost:3001

## 📝 หมายเหตุ

- สำหรับ production ควรใช้ Firebase configuration จริง
- สำหรับ development สามารถใช้ Firebase emulators
- ควรตั้งค่า Firestore security rules สำหรับ production
- ควรเปิดใช้งาน email verification สำหรับ production

## 🚀 Production Deployment

1. เปลี่ยน Firebase configuration เป็น production
2. ตั้งค่า Firestore security rules
3. เปิดใช้งาน email verification
4. ตั้งค่า custom domain (optional)
5. เปิดใช้งาน Firebase Hosting (optional)

