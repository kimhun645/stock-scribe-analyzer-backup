# Firebase Authentication Integration Example

## ตัวอย่างการใช้งาน Firebase Authentication ในระบบ

### 1. Frontend - การล็อกอินด้วย Firebase

```javascript
// src/contexts/AuthContext.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { auth as apiAuth } from '../lib/apiService';

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1. ล็อกอินด้วย Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // 2. รับ Firebase ID Token
    const idToken = await userCredential.user.getIdToken();
    console.log('🔐 Firebase ID Token obtained:', idToken.substring(0, 20) + '...');
    
    // 3. ตั้งค่า token ใน API service
    apiAuth.setFirebaseIdToken(idToken);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

### 2. Frontend - การเรียก API ด้วย Firebase ID Token

```javascript
// src/lib/apiService.ts
export class ApiService {
  private static async fetchApi(endpoint: string, options: RequestInit = {}) {
    try {
      // รับ Firebase ID Token
      const firebaseToken = auth.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // ส่ง Firebase ID Token ไปยัง Backend
      if (firebaseToken) {
        headers['Authorization'] = `Bearer ${firebaseToken}`;
        console.log(`🔐 Using Firebase ID Token for API call: ${endpoint}`);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return await handleApiResponse(response, endpoint);
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }
}
```

### 3. Backend - การตรวจสอบ Firebase ID Token

```javascript
// server.mjs
import { adminAuth } from './firebase-admin-config.js';

// Firebase Authentication Middleware
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No valid authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized - No Firebase ID token" });
    }

    try {
      // ตรวจสอบ Firebase ID Token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('✅ Firebase ID Token verified for user:', decodedToken.uid);
      
      // เพิ่มข้อมูลผู้ใช้ใน request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        isAdmin: decodedToken.email?.includes('admin') || false
      };
      
      next();
    } catch (firebaseError) {
      console.error('❌ Firebase ID Token verification failed:', firebaseError.message);
      return res.status(401).json({ 
        error: "Unauthorized - Invalid Firebase ID token",
        details: firebaseError.message 
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}
```

### 4. Backend - การใช้ข้อมูลผู้ใช้ใน API

```javascript
// ตัวอย่าง API endpoint ที่ใช้ข้อมูลผู้ใช้
app.get("/api/products", authMiddleware, async (req, res) => {
  try {
    // req.user จะมีข้อมูลจาก Firebase ID Token
    console.log('User accessing products:', req.user.email);
    
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 5. การทดสอบระบบ

```javascript
// test-firebase-auth.js
import { signInWithEmailAndPassword } from 'firebase/auth';

async function testFirebaseAuth() {
  try {
    // 1. ล็อกอินด้วย Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    // 2. ทดสอบ Backend API
    const response = await fetch('http://localhost:3001/api/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ API call successful:', products);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}
```

### 6. ข้อดีของ Firebase Authentication

1. **ความปลอดภัย**: Firebase ID Token มีการเข้ารหัสและตรวจสอบโดย Google
2. **ความสะดวก**: ไม่ต้องจัดการ JWT token เอง
3. **การจัดการ Session**: Firebase จัดการ session และ token refresh อัตโนมัติ
4. **การตรวจสอบ**: Backend ตรวจสอบ token กับ Firebase servers
5. **ความยืดหยุ่น**: รองรับการ authentication หลายรูปแบบ

### 7. การตั้งค่าสำหรับ Production

```bash
# Environment Variables สำหรับ Cloud Run
FIREBASE_PROJECT_ID=stock-6e930
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account@stock-6e930.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40stock-6e930.iam.gserviceaccount.com
```

### 8. การ Debug และ Troubleshooting

```javascript
// ตรวจสอบ Firebase ID Token
console.log('Token payload:', JSON.stringify(decodedToken, null, 2));

// ตรวจสอบการเชื่อมต่อ Firebase Admin
adminAuth.verifyIdToken(idToken)
  .then(decodedToken => {
    console.log('✅ Token verified:', decodedToken.uid);
  })
  .catch(error => {
    console.error('❌ Token verification failed:', error.message);
  });
```
