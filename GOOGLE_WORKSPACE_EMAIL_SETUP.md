# การตั้งค่า Google Workspace Email สำหรับ Supabase Edge Function

## ✅ สิ่งที่ทำเสร็จแล้ว

1. **สร้าง Edge Function** `/supabase/functions/send-email/index.ts`
   - ใช้ Nodemailer กับ Google Workspace SMTP
   - รองรับ CC, HTML, และ plain text
   - มี CORS headers สำหรับ frontend

2. **อัพเดท emailService.ts**
   - เรียก Supabase Edge Function แทน backend API
   - ส่ง Authorization header ด้วย Supabase Anon Key

3. **Modal เพิ่มคำขออนุมัติ** (`AddBudgetRequestDialog.tsx`)
   - ปุ่ม "ส่งคำขออนุมัติและอีเมล" พร้อมใช้งาน
   - ส่งอีเมลพร้อม link อนุมัติไปยังผู้อนุมัติ

## 📋 ขั้นตอนการตั้งค่า Google Workspace

### 1. สร้าง App Password สำหรับ Google Workspace

1. ไปที่ [Google Account](https://myaccount.google.com/)
2. เลือก **Security** > **2-Step Verification** (ต้องเปิดใช้งานก่อน)
3. เลือก **App passwords**
4. สร้าง App Password ใหม่:
   - App: Mail
   - Device: Other (custom name) - ใส่ "Material Management System"
5. **คัดลอก password 16 ตัว** (จะแสดงเพียงครั้งเดียว)

### 2. ตั้งค่า Supabase Secrets

ใน Supabase Dashboard:

1. ไปที่ **Project Settings** > **Edge Functions**
2. เพิ่ม **Secrets** ดังนี้:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=koratnrs@rockchatn.com
SMTP_PASS=<App_Password_16_ตัวที่ได้จาก_Google>
```

**หมายเหตุ:** `SMTP_PASS` ต้องเป็น App Password ที่ได้จาก Google ไม่ใช่รหัสผ่านปกติ

### 3. Deploy Edge Function

หลังตั้งค่า Secrets แล้ว ให้ deploy Edge Function:

```bash
# ถ้ามี Supabase CLI
supabase functions deploy send-email

# หรือใช้ Supabase Dashboard
# ไปที่ Edge Functions > New Function > อัพโหลด /supabase/functions/send-email/
```

### 4. ทดสอบการส่งเมล์

1. เข้าหน้า **เพิ่มคำขออนุมัติใช้งบประมาณ**
2. กรอกข้อมูล:
   - ผู้ขอใช้งบประมาณ
   - รหัสบัญชี
   - จำนวนเงิน
   - **ผู้อนุมัติ** (ต้องมีอีเมล)
   - CC Email (ถ้ามี)
3. กด **"ส่งคำขออนุมัติและอีเมล"**
4. ตรวจสอบ:
   - ✅ Toast แสดง "ส่งคำขออนุมัติเรียบร้อยแล้ว"
   - ✅ ผู้อนุมัติได้รับอีเมลพร้อม link
   - ✅ CC (ถ้ามี) ได้รับอีเมล

## 🔧 Troubleshooting

### ปัญหา: "SMTP_PASS environment variable is required"

**แก้ไข:** ตรวจสอบว่าตั้งค่า Secret `SMTP_PASS` ใน Supabase แล้วและ deploy function ใหม่

### ปัญหา: "Invalid login: 535-5.7.8 Username and Password not accepted"

**แก้ไข:**
1. ตรวจสอบว่าเปิด 2-Step Verification แล้ว
2. สร้าง App Password ใหม่
3. อัพเดท `SMTP_PASS` ใน Supabase Secrets

### ปัญหา: Edge Function timeout

**แก้ไข:** Google SMTP อาจใช้เวลานานในครั้งแรก ลองส่งใหม่อีกครั้ง

## 📧 ตัวอย่างอีเมลที่จะส่ง

อีเมลจะมีรูปแบบ:

**From:** koratnrs@rockchatn.com
**To:** ผู้อนุมัติ@example.com
**CC:** (ถ้ามี)
**Subject:** 📋 คำขออนุมัติใช้งบประมาณ BR-2025-XXX

**เนื้อหา:**
- ข้อมูลคำขอ (เลขที่, ผู้ขอ, วันที่, รหัสบัญชี, จำนวนเงิน)
- รายการวัสดุที่ขออนุมัติ
- ปุ่ม "📋 พิจารณาอนุมัติ" → Link ไปหน้า `/approval/{id}`

## 🚀 การใช้งาน

หลังจากตั้งค่าเสร็จแล้ว:

1. ปุ่ม **"ส่งคำขออนุมัติและอีเมล"** จะส่งอีเมลจริง
2. ผู้อนุมัติคลิก link ในอีเมล
3. เข้าหน้าอนุมัติและพิจารณา
4. ระบบบันทึกประวัติการอนุมัติ

## 📝 หมายเหตุ

- ใช้ **Google Workspace SMTP** (smtp.gmail.com:587)
- ส่ง **จาก** koratnrs@rockchatn.com
- รองรับ **CC** หลายอีเมล (คั่นด้วย comma)
- มี **HTML template** สวยงามพร้อม logo และสี
- **ปลอดภัย** ผ่าน Supabase Edge Function (ไม่เปิดเผย credentials ใน frontend)
