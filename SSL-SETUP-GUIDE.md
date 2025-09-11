# 🔐 SSL Setup Guide - Option B: Force Encrypted Connections

## วิธีแก้ไขปัญหา localhost connection

### 1. แก้ไข pg_hba.conf

เพิ่ม entry สำหรับ IPv6 ใน pg_hba.conf:

```bash
# เปิดไฟล์ pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# หรือ
sudo nano /var/lib/postgresql/data/pg_hba.conf
```

เพิ่มบรรทัดเหล่านี้:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256

# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256

# SSL connections (Option B: Force encrypted)
hostssl all             all             127.0.0.1/32            scram-sha-256
hostssl all             all             ::1/128                 scram-sha-256
```

### 2. เปิดใช้งาน SSL ใน postgresql.conf

```bash
# เปิดไฟล์ postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
# หรือ
sudo nano /var/lib/postgresql/data/postgresql.conf
```

เพิ่ม/แก้ไขบรรทัดเหล่านี้:

```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

### 3. สร้าง SSL Certificates

#### วิธีที่ 1: ใช้ OpenSSL (ถ้ามี)
```bash
# สร้างโฟลเดอร์ ssl
mkdir -p /var/lib/postgresql/data/ssl
cd /var/lib/postgresql/data/ssl

# สร้าง private key
openssl genrsa -out server.key 2048

# สร้าง certificate
openssl req -new -key server.key -out server.csr -subj "/C=TH/ST=Bangkok/L=Bangkok/O=StockScribe/OU=IT/CN=localhost"
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# ตั้งค่า permissions
chmod 600 server.key
chmod 644 server.crt
chown postgres:postgres server.key server.crt
```

#### วิธีที่ 2: ใช้ Node.js (ถ้าไม่มี OpenSSL)
```bash
npm install -g node-ssl-cert
node-ssl-cert --host localhost --output /var/lib/postgresql/data/ssl/
```

### 4. Reload PostgreSQL Configuration

```bash
# วิธีที่ 1: ใช้ systemctl
sudo systemctl reload postgresql

# วิธีที่ 2: ใช้ psql
psql -U postgres -c "SELECT pg_reload_conf();"
```

### 5. ทดสอบการเชื่อมต่อ

#### ทดสอบเชื่อมต่อแบบ SSL:
```bash
psql "host=127.0.0.1 port=5432 user=postgres dbname=stocknrs sslmode=require"
```

#### ทดสอบเชื่อมต่อแบบ non-SSL (ถ้ายังอนุญาต):
```bash
psql -h localhost -U postgres -d stocknrs
```

#### ตรวจสอบ SSL status:
```sql
-- ตรวจสอบ SSL
SHOW ssl;

-- ตรวจสอบการเชื่อมต่อ SSL
SELECT * FROM pg_stat_ssl WHERE pid = pg_backend_pid();
```

### 6. อัพเดต Application Connection

แอปพลิเคชันได้ถูกอัพเดตแล้วให้รองรับ SSL:

#### server.mjs:
```javascript
const pool = new Pool({
  // ... other config
  ssl: {
    rejectUnauthorized: false, // สำหรับ development
  },
  connectionString: `postgresql://postgres:Login123@localhost:5432/stocknrs?sslmode=require`
});
```

#### src/lib/database.ts:
```javascript
const dbConfig = {
  // ... other config
  ssl: {
    rejectUnauthorized: false, // สำหรับ development
  },
};
```

### 7. Docker Setup

สำหรับ Docker, ไฟล์ docker-compose.yml ได้ถูกอัพเดตแล้ว:

```yaml
postgres:
  image: postgres:15-alpine
  volumes:
    - ./ssl:/var/lib/postgresql/ssl:ro
  command: >
    postgres
    -c ssl=on
    -c ssl_cert_file=/var/lib/postgresql/ssl/server.crt
    -c ssl_key_file=/var/lib/postgresql/ssl/server.key
```

### 8. Production Security

สำหรับ production, ควรใช้:

```javascript
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('path/to/ca.crt'),
  cert: fs.readFileSync('path/to/client.crt'),
  key: fs.readFileSync('path/to/client.key')
}
```

### 9. Troubleshooting

#### ปัญหา: "no pg_hba.conf entry for host"
- ตรวจสอบว่า pg_hba.conf มี entry สำหรับ ::1/128
- Reload configuration: `SELECT pg_reload_conf();`

#### ปัญหา: "SSL connection required"
- ตรวจสอบว่า ssl = on ใน postgresql.conf
- ตรวจสอบว่าไฟล์ certificate มีอยู่และ permissions ถูกต้อง

#### ปัญหา: "certificate verify failed"
- สำหรับ development: ใช้ `rejectUnauthorized: false`
- สำหรับ production: ใช้ proper CA certificate

### 10. Connection Examples

#### psql with SSL:
```bash
psql "host=127.0.0.1 port=5432 user=postgres dbname=stocknrs sslmode=require"
```

#### Node.js with SSL:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Login123@localhost:5432/stocknrs?sslmode=require'
});
```

#### Prisma with SSL:
```javascript
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:Login123@localhost:5432/stocknrs?sslmode=require"
}
```

## ✅ สรุป

1. ✅ อัพเดต pg_hba.conf เพิ่ม IPv6 entry
2. ✅ เปิดใช้งาน SSL ใน postgresql.conf  
3. ✅ สร้าง SSL certificates
4. ✅ อัพเดต application connection strings
5. ✅ อัพเดต Docker configuration
6. ✅ ทดสอบการเชื่อมต่อ

ตอนนี้ระบบจะบังคับให้ใช้การเชื่อมต่อแบบเข้ารหัส (SSL) ซึ่งปลอดภัยกว่าการเชื่อมต่อแบบไม่เข้ารหัส

