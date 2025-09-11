# การตั้งค่า UTF-8 แบบถาวร

## 🚀 วิธีการเริ่มต้นเซิร์ฟเวอร์

### วิธีที่ 1: ใช้ npm script (แนะนำ)
```bash
npm run start:utf8
```

### วิธีที่ 2: ทดสอบ UTF-8 encoding
```bash
npm run test:utf8
```

### วิธีที่ 3: ใช้ batch file (Windows)
```bash
start-server.bat
```

### วิธีที่ 4: ใช้ shell script (Linux/Mac)
```bash
chmod +x start-server.sh
./start-server.sh
```

### วิธีที่ 5: ตั้งค่า environment variables เอง
```bash
# Windows
set PGCLIENTENCODING=UTF8
set LANG=th_TH.UTF-8
set LC_ALL=th_TH.UTF-8
node server.mjs

# Linux/Mac
export PGCLIENTENCODING=UTF8
export LANG=th_TH.UTF-8
export LC_ALL=th_TH.UTF-8
node server.mjs
```

## 🔧 การตั้งค่าที่แก้ไข

### 1. Database Connection
- เพิ่ม `client_encoding: 'UTF8'`
- เพิ่ม `options: '-c client_encoding=UTF8'`
- อัพเดตทั้ง `src/lib/database.ts` และ `server.mjs`

### 2. Express Server
- เพิ่ม middleware สำหรับ UTF-8 headers
- เพิ่ม body parser limits
- ตั้งค่า charset=utf-8

### 3. Package.json Scripts
- เพิ่ม `start:utf8` script พร้อม environment variables
- เพิ่ม `test:utf8` script สำหรับทดสอบ encoding
- เพิ่ม `PGCLIENTENCODING=UTF8` ในทุก script

### 4. Database Schema
- เพิ่ม `SET client_encoding = 'UTF8'` ใน init.sql
- แนะนำการสร้าง database พร้อม UTF-8 encoding

### 5. Testing Scripts
- สร้าง `test-utf8-encoding.js` สำหรับทดสอบ UTF-8
- ทดสอบการแสดงผลข้อความไทย
- ทดสอบการบันทึกและอ่านข้อมูลไทย

## 📝 หมายเหตุ

- การตั้งค่าเหล่านี้จะแก้ไขปัญหา UTF-8 encoding แบบถาวร
- ข้อมูลไทยจะแสดงผลถูกต้องทั้งในฐานข้อมูลและ API
- สามารถใช้ได้ทั้งใน development และ production

## 🐛 การแก้ไขปัญหา

หากยังมีปัญหา encoding:
1. ตรวจสอบว่าใช้ script ที่ถูกต้อง
2. ตรวจสอบ environment variables
3. ตรวจสอบการตั้งค่า database
4. ลองใช้ batch file หรือ shell script



