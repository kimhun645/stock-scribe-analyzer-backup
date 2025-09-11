# 📦 ระบบบริหารพัสดุ

ระบบบริหารพัสดุและวัสดุครบวงจร พัฒนาด้วย React + TypeScript + PostgreSQL

## ✨ ฟีเจอร์หลัก

- **📊 Dashboard** - แสดงสถิติและกราฟการเคลื่อนไหวพัสดุ
- **🏷️ จัดการพัสดุ** - เพิ่ม/แก้ไข/ลบพัสดุ พร้อมระบบบาร์โค้ด
- **📂 หมวดหมู่** - จัดกลุ่มพัสดุอย่างเป็นระบบ
- **🏢 ซัพพลายเออร์** - จัดการข้อมูลผู้จัดหา
- **📈 การเคลื่อนไหว** - บันทึกการเข้า-ออกพัสดุ
- **💰 งบประมาณ** - ระบบขออนุมัติงบประมาณ
- **⚙️ การตั้งค่า** - ปรับแต่งระบบตามความต้องการ

## 🚀 การติดตั้ง

### ข้อกำหนดระบบ
- Node.js 18+ 
- PostgreSQL 15+
- npm หรือ bun

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจค**
```bash
git clone <repository-url>
cd stock-scribe-analyzer
```

2. **ติดตั้ง Dependencies**
```bash
npm install
# หรือ
bun install
```

3. **ตั้งค่าฐานข้อมูล**
```bash
# สร้างฐานข้อมูล PostgreSQL
createdb stocknrs

# รัน SQL script
psql -d stocknrs -f database_setup.sql
```

4. **ตั้งค่า Environment Variables**
```bash
cp env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ
```

5. **รัน Development Server**
```bash
npm run dev
# หรือ
bun dev
```

## 🗄️ โครงสร้างฐานข้อมูล

### ตารางหลัก
- `products` - ข้อมูลสินค้า
- `categories` - หมวดหมู่สินค้า
- `suppliers` - ซัพพลายเออร์
- `movements` - การเคลื่อนไหวสต็อก
- `budget_requests` - คำของบประมาณ
- `account_codes` - รหัสบัญชี
- `users` - ผู้ใช้งานระบบ

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **Recharts** - Data Visualization

### Backend & Database
- **PostgreSQL** - ฐานข้อมูลหลัก
- **Supabase** - Backend as a Service (Legacy)
- **EmailJS** - Email Service

### State Management
- **React Context** - Global State
- **React Query** - Server State
- **React Hook Form** - Form Management

## 📱 การใช้งาน

### การเข้าสู่ระบบ
1. เปิดเบราว์เซอร์ไปที่ `http://localhost:8080`
2. เข้าสู่ระบบด้วยบัญชีที่สร้างไว้

### การจัดการสินค้า
1. ไปที่หน้า "สินค้า"
2. คลิก "เพิ่มสินค้า" เพื่อเพิ่มสินค้าใหม่
3. กรอกข้อมูลสินค้าและบันทึก

### การสแกนบาร์โค้ด
1. ไปที่หน้า "สแกน"
2. ใช้เครื่องสแกนบาร์โค้ดหรือพิมพ์รหัส
3. ระบบจะค้นหาสินค้าอัตโนมัติ

## 🔧 การพัฒนา

### Scripts ที่มี
```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm run lint         # ตรวจสอบ code quality
npm run preview      # Preview production build
```

### โครงสร้างโปรเจค
```
src/
├── components/       # React Components
├── pages/           # Page Components
├── contexts/        # React Contexts
├── hooks/           # Custom Hooks
├── lib/             # Utility Libraries
├── types/           # TypeScript Types
└── utils/           # Helper Functions
```

## 📊 สถิติการใช้งาน

- **สินค้า**: จัดการรายการสินค้าได้ไม่จำกัด
- **หมวดหมู่**: สร้างหมวดหมู่ได้ไม่จำกัด
- **ซัพพลายเออร์**: จัดการผู้จัดหาได้ไม่จำกัด
- **การเคลื่อนไหว**: บันทึกประวัติการเข้า-ออกสต็อก
- **รายงาน**: สร้างรายงานสรุปได้หลากหลายรูปแบบ

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **การเชื่อมต่อฐานข้อมูล**
   - ตรวจสอบ PostgreSQL service
   - ตรวจสอบ connection string ใน .env

2. **EmailJS ไม่ทำงาน**
   - ตรวจสอบ API keys
   - ดูรายละเอียดใน `EMAILJS_TROUBLESHOOTING.md`

3. **Build Error**
   - รัน `npm run lint` เพื่อตรวจสอบ
   - แก้ไข TypeScript errors

## 📝 License

MIT License - ดูรายละเอียดใน LICENSE file

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Issues ใน GitHub
2. สร้าง Issue ใหม่พร้อมรายละเอียด
3. ติดต่อทีมพัฒนา

---

**พัฒนาโดย** ทีม Stock Scribe Analyzer  
**เวอร์ชัน** 1.0.0  
**อัปเดตล่าสุด** 2024
