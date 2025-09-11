# Firebase Admin SDK Setup Guide

## การตั้งค่า Firebase Admin SDK สำหรับ Backend

### 1. สร้าง Service Account Key

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจค `stock-6e930`
3. ไปที่ **Project Settings** > **Service Accounts**
4. คลิก **Generate New Private Key**
5. ดาวน์โหลดไฟล์ JSON

### 2. ตั้งค่า Environment Variables

สำหรับ **Production** (Cloud Run):

```bash
# Firebase Project Configuration
FIREBASE_PROJECT_ID=stock-6e930

# Firebase Service Account
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@stock-6e930.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40stock-6e930.iam.gserviceaccount.com
```

สำหรับ **Development**:
- ใช้ Application Default Credentials
- หรือ Firebase Emulator
- ไม่ต้องตั้งค่า environment variables

### 3. การทำงานของระบบ

#### Frontend (React)
1. ผู้ใช้ล็อกอินด้วย Firebase Authentication
2. ได้ Firebase ID Token
3. ส่ง ID Token ไปยัง Backend ทุกครั้งที่เรียก API

#### Backend (Node.js)
1. รับ Firebase ID Token จาก Frontend
2. ใช้ Firebase Admin SDK ตรวจสอบ Token
3. ถ้า Token ถูกต้อง → ส่งข้อมูล
4. ถ้า Token ไม่ถูกต้อง → ส่ง 401 Unauthorized

### 4. ตัวอย่างการใช้งาน

#### Frontend
```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    
    // ใช้ token นี้เรียก API
    callProtectedAPI(idToken);
  });
```

#### Backend
```javascript
import { adminAuth } from './firebase-admin-config.js';

async function authMiddleware(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
```

### 5. การทดสอบ

1. ล็อกอินด้วย Firebase Authentication
2. เรียก API endpoint ที่ต้องการ
3. ตรวจสอบว่าได้รับข้อมูลหรือไม่
4. ตรวจสอบ logs ใน Backend

### 6. Troubleshooting

#### ปัญหาที่อาจเกิดขึ้น:
- **Firebase Admin SDK ไม่สามารถ initialize ได้**
  - ตรวจสอบ environment variables
  - ตรวจสอบ Service Account permissions

- **Token verification ล้มเหลว**
  - ตรวจสอบว่า Token ยังไม่หมดอายุ
  - ตรวจสอบว่า Project ID ถูกต้อง

- **CORS errors**
  - ตรวจสอบ CORS configuration ใน Backend

### 7. Security Notes

- Firebase ID Token มีอายุ 1 ชั่วโมง
- Token จะถูก refresh อัตโนมัติโดย Firebase SDK
- ใช้ HTTPS เสมอใน Production
- เก็บ Service Account Key อย่างปลอดภัย
