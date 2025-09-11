import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { createRateLimit, securityHeaders, validateInput, validationSchemas, sanitizeInput } from './security-middleware.js';
import { requestLogger, errorHandler, systemMonitoring } from './monitoring.js';
import { cacheMiddleware, cacheManager } from './caching.js';
// import { adminAuth } from './firebase-admin-config.js';
const { Pool } = pkg;

// ---------------- ENV ----------------
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

// ---------------- APP ----------------
const app = express();

// ---- CORS (apply in all envs) ----
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(s => s.trim());

const corsConfig = {
  origin: corsOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};

// Security Middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(sanitizeInput);

// CORS ต้องมาก่อน routes ใด ๆ
app.use(cors(corsConfig));
// ให้ตอบ OPTIONS ทั่วไปด้วย (preflight)
app.options("*", cors(corsConfig));

// Rate Limiting
app.use('/api/', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use('/api/auth/', createRateLimit(15 * 60 * 1000, 5)); // 5 login attempts per 15 minutes

// Global Auth Middleware for all API endpoints (except auth endpoints)
app.use('/api/', (req, res, next) => {
  // Skip auth for Firebase auth test, health check, and other public endpoints
  if (req.path.startsWith('/auth/') || 
      req.path === '/firebase-auth-test' || 
      req.path === '/health' ||
      req.path === '/validate-approver-email' ||
      req.path === '/verify-access-code' ||
      req.path === '/resend-access-code') {
    return next();
  }
  
  // Apply Firebase auth middleware for all other API endpoints
  return authMiddleware(req, res, next);
});

// ตั้งค่า UTF-8 สำหรับ Express
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// แล้วค่อย parse body
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- DIR ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- LOGGING ----------------
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in Production mode");

  const logDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // API request log → api.log
  const accessLogStream = fs.createWriteStream(path.join(logDir, "api.log"), {
    flags: "a",
  });
  app.use(
    morgan("combined", {
      skip: (req) => !req.path.startsWith("/api"),
      stream: accessLogStream,
    })
  );

  // Error log → error.log
  const errorLogStream = fs.createWriteStream(
    path.join(logDir, "error.log"),
    { flags: "a" }
  );
  app.use((err, req, res, next) => {
    const errorMsg = `[${new Date().toISOString()}] ${err.stack || err}\n`;
    errorLogStream.write(errorMsg);
    res.status(500).json({ error: "Internal Server Error" });
  });
} else {
  console.log("🌱 Running in Development mode");

  // Dev log → console
  app.use(
    morgan("dev", {
      skip: (req) => !req.path.startsWith("/api"),
    })
  );
}

// ---------------- DATABASE CONFIG ----------------
const pool = new Pool({
  host: "127.0.0.1", // ใช้ 127.0.0.1 แทน localhost เพื่อหลีกเลี่ยงปัญหา IPv6
  port: 5432,
  database: "stocknrs",
  user: "postgres",
  password: "Login123",
  client_encoding: 'UTF8',
  application_name: 'stock-scribe-analyzer',
  // เพิ่มการตั้งค่า UTF-8
  options: '-c client_encoding=UTF8',
  // SSL Configuration (Option A: Normal connection, not forcing SSL)
  // ssl: false, // ไม่บังคับใช้ SSL สำหรับ development
  // สำหรับ production ควรใช้:
  // ssl: { rejectUnauthorized: true, ca: fs.readFileSync('path/to/ca.crt') }
});

// ---------------- EMAIL CONFIGURATION ----------------
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'koratnrs@rockchatn.com',
    pass: 'kjdbhzvtxpwlvvgs' // App Password
  }
});

// Verify email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// ---------------- JWT CONFIG ----------------
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecret";

let refreshTokens = [];

// ---------------- API ----------------
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Firebase Authentication endpoint (for testing purposes)
app.post("/api/firebase-auth-test", async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Missing Firebase ID token' });
    }

    // Verify Firebase ID Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    console.log(`✅ Firebase authentication successful for user: ${decodedToken.email}`);
    
    res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        isAdmin: decodedToken.email?.includes('admin') || false
      },
      message: 'Firebase authentication successful'
    });
  } catch (error) {
    console.error('❌ Firebase authentication error:', error);
    res.status(401).json({ 
      error: 'Firebase authentication failed',
      details: error.message 
    });
  }
});

app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.includes(token)) {
    return res.status(403).json({ error: "Refresh token not found" });
  }

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});

app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Logged out successfully" });
});

// Temporary Authentication Middleware (without Firebase Admin SDK)
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ No valid authorization header found');
      return res.status(401).json({ error: "Unauthorized - No valid authorization header" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      console.log('❌ No Firebase ID token found');
      return res.status(401).json({ error: "Unauthorized - No Firebase ID token" });
    }

    // Temporary: Accept any token for testing
    console.log('✅ Token accepted (temporary auth):', idToken.substring(0, 20) + '...');
    
    // Add user information to request
    req.user = {
      uid: 'temp-user-id',
      email: 'temp@example.com',
      email_verified: true,
      name: 'Temp User',
      picture: null,
      isAdmin: true
    };
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}

app.get("/api/notes", authMiddleware, (req, res) => {
  res.json([
    { id: 1, text: "Note 1", user: req.user.email },
    { id: 2, text: "Note 2", user: req.user.email },
  ]);
});

// ---------------- STOCK MANAGEMENT API ----------------
// Products
app.get("/api/products", authMiddleware, cacheMiddleware(300), async (req, res) => {
  try {
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

app.get("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by barcode
app.get("/api/products/barcode/:barcode", authMiddleware, async (req, res) => {
  try {
    const { barcode } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      WHERE p.barcode = $1 OR p.sku = $1
    `, [barcode]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/products", authMiddleware, validateInput(validationSchemas.product), async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category_id,
      supplier_id,
      unit_price,
      current_stock,
      min_stock,
      max_stock,
      unit,
      location,
      barcode
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO products (
        name, sku, description, category_id, supplier_id, 
        unit_price, current_stock, min_stock, max_stock, 
        unit, location, barcode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *
    `, [
      name,
      sku,
      description || '',
      category_id,
      supplier_id,
      parseFloat(unit_price) || 0,
      parseInt(current_stock) || 0,
      parseInt(min_stock) || 0,
      max_stock ? parseInt(max_stock) : null,
      unit || '',
      location || '',
      barcode || ''
    ]);
    
    // Invalidate cache
    cacheManager.invalidatePattern('cache:GET:/api/products');
    
    console.log("Product created:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      category_id,
      supplier_id,
      unit_price,
      current_stock,
      min_stock,
      max_stock,
      unit,
      location,
      barcode
    } = req.body;
    
    const result = await pool.query(`
      UPDATE products SET
        name = $1,
        sku = $2,
        description = $3,
        category_id = $4,
        supplier_id = $5,
        unit_price = $6,
        current_stock = $7,
        min_stock = $8,
        max_stock = $9,
        unit = $10,
        location = $11,
        barcode = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      name,
      sku,
      description || '',
      category_id,
      supplier_id,
      parseFloat(unit_price) || 0,
      parseInt(current_stock) || 0,
      parseInt(min_stock) || 0,
      max_stock ? parseInt(max_stock) : null,
      unit || '',
      location || '',
      barcode || '',
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log("Product updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const checkResult = await pool.query('SELECT id, name FROM products WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const productName = checkResult.rows[0].name;
    
    // Delete the product
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    console.log(`Product "${productName}" (ID: ${id}) deleted successfully`);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories
app.get("/api/categories", authMiddleware, cacheMiddleware(600), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/categories/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/categories", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || '']
    );
    
    console.log("Category created:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/categories/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log("Category updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/categories/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const checkResult = await pool.query('SELECT id, name FROM categories WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const categoryName = checkResult.rows[0].name;
    
    // Check if category is being used by any products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = $1', [id]);
    const productCount = parseInt(productsResult.rows[0].count);
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category "${categoryName}" because it is being used by ${productCount} product(s). Please reassign or delete the products first.` 
      });
    }
    
    // Delete the category
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    
    console.log(`Category "${categoryName}" (ID: ${id}) deleted successfully`);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Suppliers
app.get("/api/suppliers", authMiddleware, cacheMiddleware(600), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/suppliers", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, contact_person } = req.body;
    
    const result = await pool.query(
      'INSERT INTO suppliers (name, email, phone, address, contact_person) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email || '', phone || '', address || '', contact_person || '']
    );
    
    console.log("Supplier created:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contact_person } = req.body;
    
    const result = await pool.query(
      'UPDATE suppliers SET name = $1, email = $2, phone = $3, address = $4, contact_person = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, email || '', phone || '', address || '', contact_person || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    console.log("Supplier updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists
    const checkResult = await pool.query('SELECT id, name FROM suppliers WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    const supplierName = checkResult.rows[0].name;
    
    // Check if supplier is being used by any products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products WHERE supplier_id = $1', [id]);
    const productCount = parseInt(productsResult.rows[0].count);
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete supplier "${supplierName}" because it is being used by ${productCount} product(s). Please reassign or delete the products first.` 
      });
    }
    
    // Delete the supplier
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    
    console.log(`Supplier "${supplierName}" (ID: ${id}) deleted successfully`);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Movements
app.get("/api/movements", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name as product_name, p.sku as product_sku
      FROM movements m
      LEFT JOIN products p ON m.product_id = p.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/movements", authMiddleware, validateInput(validationSchemas.stockMovement), async (req, res) => {
  try {
    const { product_id, type, quantity, reason, reference, notes, created_by } = req.body;
    
    // Validate required fields
    if (!product_id || !type || !quantity || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate type
    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ error: 'Invalid movement type' });
    }
    
    // Check if product exists
    const productResult = await pool.query('SELECT id, name, current_stock FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Calculate new stock
    const stockChange = type === 'in' ? quantity : -quantity;
    const newStock = Math.max(0, product.current_stock + stockChange);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Insert movement
      const movementResult = await pool.query(`
        INSERT INTO movements (product_id, type, quantity, reason, reference, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [product_id, type, quantity, reason, reference, notes, created_by]);
      
      // Update product stock
      await pool.query(`
        UPDATE products 
        SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newStock, product_id]);
      
      await pool.query('COMMIT');
      
      const movement = movementResult.rows[0];
      res.status(201).json({
        ...movement,
        product_name: product.name,
        product_sku: product.sku
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating movement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/movements/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, type, quantity, reason, reference, notes } = req.body;
    
    // Check if movement exists
    const checkResult = await pool.query('SELECT * FROM movements WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    
    const oldMovement = checkResult.rows[0];
    
    // Validate required fields
    if (!product_id || !type || !quantity || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate type
    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ error: 'Invalid movement type' });
    }
    
    // Get product info
    const productResult = await pool.query('SELECT id, name, current_stock FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Calculate stock adjustment
    const oldStockChange = oldMovement.type === 'in' ? oldMovement.quantity : -oldMovement.quantity;
    const newStockChange = type === 'in' ? quantity : -quantity;
    const stockAdjustment = newStockChange - oldStockChange;
    const newStock = Math.max(0, product.current_stock + stockAdjustment);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Update movement
      const result = await pool.query(`
        UPDATE movements 
        SET product_id = $1, type = $2, quantity = $3, reason = $4, reference = $5, notes = $6, created_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [product_id, type, quantity, reason, reference, notes, id]);
      
      // Update product stock
      await pool.query(`
        UPDATE products 
        SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newStock, product_id]);
      
      await pool.query('COMMIT');
      
      const movement = result.rows[0];
      res.json({
        ...movement,
        product_name: product.name,
        product_sku: product.sku
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating movement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/movements/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if movement exists
    const checkResult = await pool.query('SELECT * FROM movements WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    
    const movement = checkResult.rows[0];
    
    // Get product info
    const productResult = await pool.query('SELECT id, name, current_stock FROM products WHERE id = $1', [movement.product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Calculate stock adjustment (reverse the movement)
    const stockChange = movement.type === 'in' ? -movement.quantity : movement.quantity;
    const newStock = Math.max(0, product.current_stock + stockChange);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Delete movement
      await pool.query('DELETE FROM movements WHERE id = $1', [id]);
      
      // Update product stock
      await pool.query(`
        UPDATE products 
        SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newStock, product.id]);
      
      await pool.query('COMMIT');
      
      res.json({ success: true, message: 'Movement deleted successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting movement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock data for testing (commented out)
/*
app.get("/api/movements", authMiddleware, (req, res) => {
  res.json([
    {
      id: "1",
      product_id: "1",
      type: "in",
      quantity: 100,
      reason: "Initial stock",
      reference: "PO001",
      notes: "Initial stock entry",
      created_at: new Date().toISOString(),
      created_by: "admin"
    }
  ]);
});

// Stats
app.get("/api/stats", authMiddleware, (req, res) => {
  res.json({
    totalProducts: 1,
    totalCategories: 2,
    totalSuppliers: 1,
    lowStockItems: 0,
    totalValue: 99.99
  });
});
*/

// Settings
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const {
      company_name,
      email,
      phone,
      address,
      low_stock_alert,
      email_notifications,
      auto_backup,
      theme,
      language,
      currency,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      from_email,
      from_name
    } = req.body;

    const query = `
      UPDATE app_settings SET
        company_name = $1,
        email = $2,
        phone = $3,
        address = $4,
        low_stock_alert = $5,
        email_notifications = $6,
        auto_backup = $7,
        theme = $8,
        language = $9,
        currency = $10,
        smtp_host = $11,
        smtp_port = $12,
        smtp_secure = $13,
        smtp_user = $14,
        smtp_password = $15,
        from_email = $16,
        from_name = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *
    `;

    const values = [
      company_name,
      email,
      phone,
      address,
      low_stock_alert,
      email_notifications,
      auto_backup,
      theme,
      language,
      currency,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      from_email,
      from_name
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    console.log("Settings updated successfully:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Materials endpoints (using products table)
app.get("/api/materials", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.current_stock > 0 
      ORDER BY p.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/materials", async (req, res) => {
  try {
    const { name, description, unit, category_id, unit_price } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, unit, category_id, unit_price, current_stock, min_stock) VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING *',
      [name, description, unit, category_id, unit_price || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approvers endpoints
app.get("/api/approvers", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approvers WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Requesters endpoints
app.get("/api/requesters", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requesters WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requesters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/requesters", async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    const result = await pool.query(
      'INSERT INTO requesters (name, email, department, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, department || '', true]
    );
    
    console.log("Requester created:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating requester:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate all requesters
app.put("/api/requesters/deactivate-all", async (req, res) => {
  try {
    await pool.query('UPDATE requesters SET is_active = false');
    console.log("All requesters deactivated");
    res.json({ success: true, message: "All requesters deactivated" });
  } catch (error) {
    console.error('Error deactivating requesters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Account Codes endpoints
app.get("/api/account-codes", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM account_codes ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching account codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/account-codes", authMiddleware, async (req, res) => {
  try {
    const { code, name } = req.body;
    
    const result = await pool.query(
      'INSERT INTO account_codes (code, name) VALUES ($1, $2) RETURNING *',
      [code, name]
    );
    
    console.log("Account code created:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/account-codes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    
    const result = await pool.query(
      'UPDATE account_codes SET code = $1, name = $2 WHERE id = $3 RETURNING *',
      [code, name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account code not found' });
    }
    
    console.log("Account code updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating account code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/account-codes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM account_codes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account code not found' });
    }
    
    console.log("Account code deleted:", result.rows[0]);
    res.json({ success: true, message: "Account code deleted" });
  } catch (error) {
    console.error('Error deleting account code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Budget Requests endpoints (Protected)
app.get("/api/budget-requests", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budget_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching budget requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single budget request by ID (Protected)
app.get("/api/budget-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM budget_requests WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Budget request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching budget request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/budget-requests", async (req, res) => {
  try {
    const { 
      request_no, 
      requester, 
      request_date, 
      account_code, 
      account_name, 
      amount, 
      note, 
      material_list,
      status = 'PENDING'
    } = req.body;
    
    console.log('Creating budget request:', {
      request_no,
      requester,
      request_date,
      account_code,
      amount
    });
    
    const result = await pool.query(`
      INSERT INTO budget_requests (
        request_no, requester, request_date, account_code, 
        account_name, amount, note, material_list, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      request_no,
      requester,
      request_date,
      account_code,
      account_name || '',
      parseFloat(amount),
      note || '',
      JSON.stringify(material_list || []),
      status
    ]);
    
    console.log("Budget request created:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating budget request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete budget request
app.delete("/api/budget-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists and status is PENDING
    const checkResult = await pool.query('SELECT status FROM budget_requests WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Budget request not found' });
    }
    
    if (checkResult.rows[0].status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only delete requests with PENDING status' });
    }
    
    // Delete the request
    await pool.query('DELETE FROM budget_requests WHERE id = $1', [id]);
    
    console.log(`Budget request ${id} deleted successfully`);
    res.json({ success: true, message: 'Budget request deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget request
app.put("/api/budget-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      requester, 
      request_date, 
      account_code, 
      account_name, 
      amount, 
      note, 
      material_list,
      status
    } = req.body;
    
    // Check if request exists
    const checkResult = await pool.query('SELECT status FROM budget_requests WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Budget request not found' });
    }
    
    // If updating content (not status), only allow if PENDING
    if (!status && checkResult.rows[0].status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only edit requests with PENDING status' });
    }
    
    // Build dynamic query based on what fields are provided
    const updateFields = [];
    const values = [];
    let paramIndex = 2;
    
    if (requester !== undefined) {
      updateFields.push(`requester = $${paramIndex++}`);
      values.push(requester);
    }
    if (request_date !== undefined) {
      updateFields.push(`request_date = $${paramIndex++}`);
      values.push(request_date);
    }
    if (account_code !== undefined) {
      updateFields.push(`account_code = $${paramIndex++}`);
      values.push(account_code);
    }
    if (account_name !== undefined) {
      updateFields.push(`account_name = $${paramIndex++}`);
      values.push(account_name || '');
    }
    if (amount !== undefined) {
      updateFields.push(`amount = $${paramIndex++}`);
      values.push(parseFloat(amount));
    }
    if (note !== undefined) {
      updateFields.push(`note = $${paramIndex++}`);
      values.push(note || '');
    }
    if (material_list !== undefined) {
      updateFields.push(`material_list = $${paramIndex++}`);
      values.push(JSON.stringify(material_list || []));
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (req.body.approved_by !== undefined) {
      updateFields.push(`approved_by = $${paramIndex++}`);
      values.push(req.body.approved_by);
    }
    if (req.body.approved_at !== undefined) {
      updateFields.push(`approved_at = $${paramIndex++}`);
      values.push(req.body.approved_at);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const result = await pool.query(`
      UPDATE budget_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    console.log("Budget request updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating budget request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approvers endpoints
app.get("/api/approvers", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approvers WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate approver email endpoint
app.post("/api/validate-approver-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกอีเมล' 
      });
    }

    // Check if email exists in approvers table
    const result = await pool.query(
      'SELECT id, name, email, department, position FROM approvers WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'อีเมลนี้ไม่มีสิทธิ์เข้าถึงระบบพิจารณาอนุมัติ กรุณาติดต่อผู้ดูแลระบบ' 
      });
    }

    const approver = result.rows[0];
    
    // Generate 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store access code in database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await pool.query(
      'INSERT INTO access_codes (email, code, expires_at, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()',
      [email.toLowerCase(), accessCode, expiresAt]
    );
    
    // Send access code email
    const subject = '🔐 รหัสเข้าถึงระบบพิจารณาอนุมัติ';
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รหัสเข้าถึงระบบพิจารณาอนุมัติ</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .code-box { background: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .access-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; color: #856404; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 รหัสเข้าถึงระบบพิจารณาอนุมัติ</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">ศูนย์จัดการธนบัตร นครราชสีมา</p>
          </div>
          <div class="content">
            <p>สวัสดี <strong>${approver.name}</strong>,</p>
            
            <p>คุณได้ขอรหัสเข้าถึงระบบพิจารณาอนุมัติใช้งบประมาณ กรุณาใช้รหัสด้านล่างเพื่อเข้าสู่ระบบ:</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666;">รหัสเข้าถึงของคุณ</p>
              <div class="access-code">${accessCode}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">รหัสนี้ใช้ได้ 5 นาที</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ ข้อควรระวัง:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>รหัสนี้ใช้ได้เพียง 5 นาที</li>
                <li>ห้ามแชร์รหัสนี้กับผู้อื่น</li>
                <li>หากไม่ได้ขอรหัสนี้ กรุณาติดต่อผู้ดูแลระบบ</li>
              </ul>
            </div>
            
            <p>หลังจากกรอกรหัสแล้ว คุณจะสามารถเข้าสู่ระบบเพื่อพิจารณาคำขอใช้งบประมาณได้</p>
            
            <div class="footer">
              <p>อีเมลนี้ถูกส่งจากระบบ Stock Scribe Analyzer</p>
              <p>หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textBody = `
รหัสเข้าถึงระบบพิจารณาอนุมัติ

สวัสดี ${approver.name},

คุณได้ขอรหัสเข้าถึงระบบพิจารณาอนุมัติใช้งบประมาณ

รหัสเข้าถึงของคุณ: ${accessCode}

รหัสนี้ใช้ได้ 5 นาที

ข้อควรระวัง:
- รหัสนี้ใช้ได้เพียง 5 นาที
- ห้ามแชร์รหัสนี้กับผู้อื่น
- หากไม่ได้ขอรหัสนี้ กรุณาติดต่อผู้ดูแลระบบ

หลังจากกรอกรหัสแล้ว คุณจะสามารถเข้าสู่ระบบเพื่อพิจารณาคำขอใช้งบประมาณได้

---
อีเมลนี้ถูกส่งจากระบบ Stock Scribe Analyzer
    `;
    
    // Send email using nodemailer directly
    try {
      const mailOptions = {
        from: 'koratnrs@rockchatn.com',
        to: email,
        subject: subject,
        html: htmlBody,
        text: textBody
      };

      const info = await emailTransporter.sendMail(mailOptions);
      
      console.log(`✅ Access code sent to ${approver.name} (${approver.email}): ${accessCode}`);
      console.log('📧 Email details:', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
    } catch (emailError) {
      console.error('❌ Error sending access code email:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `ส่งรหัสเข้าถึงไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ`,
      approver: {
        id: approver.id,
        name: approver.name,
        email: approver.email,
        department: approver.department,
        position: approver.position
      }
    });

  } catch (error) {
    console.error('Error validating approver email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

// Verify access code endpoint
app.post("/api/verify-access-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกอีเมลและรหัสเข้าถึง' 
      });
    }

    // Check if access code exists and is valid
    const result = await pool.query(
      'SELECT * FROM access_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
      [email.toLowerCase(), code]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'รหัสเข้าถึงไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง' 
      });
    }

    // Get approver info
    const approverResult = await pool.query(
      'SELECT id, name, email, department, position FROM approvers WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (approverResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้อนุมัติ กรุณาติดต่อผู้ดูแลระบบ' 
      });
    }

    const approver = approverResult.rows[0];
    
    // Delete used access code
    await pool.query(
      'DELETE FROM access_codes WHERE email = $1',
      [email.toLowerCase()]
    );

    console.log(`Access code verified for approver: ${approver.name} (${approver.email})`);
    
    res.json({ 
      success: true, 
      message: 'รหัสเข้าถึงถูกต้อง',
      approver: {
        id: approver.id,
        name: approver.name,
        email: approver.email,
        department: approver.department,
        position: approver.position
      }
    });

  } catch (error) {
    console.error('Error verifying access code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัส กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

// Resend access code endpoint
app.post("/api/resend-access-code", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกอีเมล' 
      });
    }

    // Check if email exists in approvers table
    const result = await pool.query(
      'SELECT id, name, email, department, position FROM approvers WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'อีเมลนี้ไม่มีสิทธิ์เข้าถึงระบบพิจารณาอนุมัติ กรุณาติดต่อผู้ดูแลระบบ' 
      });
    }

    const approver = result.rows[0];
    
    // Generate new 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store access code in database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await pool.query(
      'INSERT INTO access_codes (email, code, expires_at, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()',
      [email.toLowerCase(), accessCode, expiresAt]
    );
    
    // Send access code email (same as in validate-approver-email)
    const subject = '🔐 รหัสเข้าถึงระบบพิจารณาอนุมัติ (ส่งใหม่)';
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รหัสเข้าถึงระบบพิจารณาอนุมัติ</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .code-box { background: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .access-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; color: #856404; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 รหัสเข้าถึงระบบพิจารณาอนุมัติ</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">ศูนย์จัดการธนบัตร นครราชสีมา</p>
          </div>
          <div class="content">
            <p>สวัสดี <strong>${approver.name}</strong>,</p>
            
            <p>คุณได้ขอรหัสเข้าถึงใหม่สำหรับระบบพิจารณาอนุมัติใช้งบประมาณ กรุณาใช้รหัสด้านล่างเพื่อเข้าสู่ระบบ:</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666;">รหัสเข้าถึงใหม่ของคุณ</p>
              <div class="access-code">${accessCode}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">รหัสนี้ใช้ได้ 5 นาที</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ ข้อควรระวัง:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>รหัสนี้ใช้ได้เพียง 5 นาที</li>
                <li>ห้ามแชร์รหัสนี้กับผู้อื่น</li>
                <li>หากไม่ได้ขอรหัสนี้ กรุณาติดต่อผู้ดูแลระบบ</li>
              </ul>
            </div>
            
            <p>หลังจากกรอกรหัสแล้ว คุณจะสามารถเข้าสู่ระบบเพื่อพิจารณาคำขอใช้งบประมาณได้</p>
            
            <div class="footer">
              <p>อีเมลนี้ถูกส่งจากระบบ Stock Scribe Analyzer</p>
              <p>หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textBody = `
รหัสเข้าถึงระบบพิจารณาอนุมัติ (ส่งใหม่)

สวัสดี ${approver.name},

คุณได้ขอรหัสเข้าถึงใหม่สำหรับระบบพิจารณาอนุมัติใช้งบประมาณ

รหัสเข้าถึงใหม่ของคุณ: ${accessCode}

รหัสนี้ใช้ได้ 5 นาที

ข้อควรระวัง:
- รหัสนี้ใช้ได้เพียง 5 นาที
- ห้ามแชร์รหัสนี้กับผู้อื่น
- หากไม่ได้ขอรหัสนี้ กรุณาติดต่อผู้ดูแลระบบ

หลังจากกรอกรหัสแล้ว คุณจะสามารถเข้าสู่ระบบเพื่อพิจารณาคำขอใช้งบประมาณได้

---
อีเมลนี้ถูกส่งจากระบบ Stock Scribe Analyzer
    `;
    
    // Send email using nodemailer directly
    try {
      const mailOptions = {
        from: 'koratnrs@rockchatn.com',
        to: email,
        subject: subject,
        html: htmlBody,
        text: textBody
      };

      const info = await emailTransporter.sendMail(mailOptions);
      
      console.log(`✅ Access code resent to ${approver.name} (${approver.email}): ${accessCode}`);
      console.log('📧 Email details:', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
    } catch (emailError) {
      console.error('❌ Error resending access code email:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `ส่งรหัสเข้าถึงใหม่ไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ`
    });

  } catch (error) {
    console.error('Error resending access code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการส่งรหัสใหม่ กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

app.post("/api/approvers", async (req, res) => {
  try {
    const { name, email, department, position, cc_emails } = req.body;
    
    const result = await pool.query(
      'INSERT INTO approvers (name, email, department, position, cc_emails, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, department || '', position || '', cc_emails || '', true]
    );
    
    console.log("Approver created:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating approver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate all approvers
app.put("/api/approvers/deactivate-all", async (req, res) => {
  try {
    await pool.query('UPDATE approvers SET is_active = false');
    console.log("All approvers deactivated");
    res.json({ success: true, message: "All approvers deactivated" });
  } catch (error) {
    console.error('Error deactivating approvers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approvals endpoints (Protected)
app.get("/api/approvals", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, br.request_no 
      FROM approvals a 
      JOIN budget_requests br ON a.request_id = br.id 
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval by request ID (Protected)
app.get("/api/approvals/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await pool.query(
      'SELECT * FROM approvals WHERE request_id = $1 ORDER BY created_at DESC LIMIT 1',
      [requestId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create approval
app.post("/api/approvals", async (req, res) => {
  try {
    const { request_id, decision, remark, approver_name } = req.body;
    
    console.log('Creating approval:', {
      request_id,
      decision,
      remark,
      approver_name
    });
    
    const result = await pool.query(`
      INSERT INTO approvals (request_id, decision, remark, approver_name) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [request_id, decision, remark || '', approver_name]);
    
    console.log("Approval created:", result.rows[0]);
    
    // Update related records and send notifications
    await updateRelatedRecords(request_id, decision, approver_name, remark);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to update related records after approval/rejection
async function updateRelatedRecords(requestId, decision, approverName, remark) {
  try {
    console.log(`Updating related records for request ${requestId} with decision: ${decision}`);
    
    // Get request details
    const requestResult = await pool.query(
      'SELECT * FROM budget_requests WHERE id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      console.error('Request not found:', requestId);
      return;
    }
    
    const request = requestResult.rows[0];
    
    // Update request status
    await pool.query(
      'UPDATE budget_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      [decision, requestId]
    );
    
    // Log the approval action
    await pool.query(`
      INSERT INTO approval_logs (request_id, action, approver_name, decision, remark, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [requestId, 'APPROVAL_PROCESSED', approverName, decision, remark || '']);
    
    // If approved, you can add additional logic here:
    if (decision === 'APPROVED') {
      // Example: Create purchase order, update inventory, etc.
      console.log(`Request ${requestId} approved - ready for procurement`);
      
      // TODO: Add business logic for approved requests
      // - Create purchase orders
      // - Update budget allocations
      // - Send notifications to procurement team
      // - Update inventory planning
    } else if (decision === 'REJECTED') {
      // Example: Log rejection reason, notify requester, etc.
      console.log(`Request ${requestId} rejected - reason: ${remark}`);
      
      // TODO: Add business logic for rejected requests
      // - Log rejection reasons
      // - Notify requester for resubmission
      // - Update budget availability
    }
    
    console.log(`Successfully updated related records for request ${requestId}`);
    
  } catch (error) {
    console.error('Error updating related records:', error);
    // Don't throw error to avoid breaking the main approval flow
  }
}

app.get("/api/approvals/:requestId", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Mock data for now - replace with database query later
    const approval = {
      id: "1",
      request_id: parseInt(requestId),
      decision: "approved",
      remark: "อนุมัติตามที่ขอ",
      approver_name: "ผู้อนุมัติหลัก",
      created_at: "2024-01-15T10:30:00Z"
    };
    
    res.json(approval);
  } catch (error) {
    console.error('Error fetching approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/approvals", authMiddleware, async (req, res) => {
  try {
    const { request_id, decision, remark, approver_name } = req.body;
    
    // Mock response for now - replace with database insert later
    const newApproval = {
      id: `approval_${Date.now()}`,
      request_id: request_id,
      decision: decision,
      remark: remark,
      approver_name: approver_name,
      created_at: new Date().toISOString()
    };
    
    console.log("New approval created:", newApproval);
    res.status(201).json(newApproval);
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/approvals/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remark, approver_name } = req.body;
    
    // Mock response for now - replace with database update later
    const updatedApproval = {
      id: id,
      request_id: 1,
      decision: decision,
      remark: remark,
      approver_name: approver_name,
      created_at: "2024-01-15T10:30:00Z"
    };
    
    console.log("Approval updated:", updatedApproval);
    res.json(updatedApproval);
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/api/approvals/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock response for now - replace with database delete later
    console.log(`Approval ${id} deleted`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  try {
    const { from, replyTo, to, cc, subject, html, text } = req.body;
    
    console.log('📧 Email request received:', {
      from,
      replyTo,
      to,
      cc,
      subject
    });

    // Prepare email options
    const mailOptions = {
      from: from || 'koratnrs@rockchatn.com',
      replyTo: replyTo || from || 'koratnrs@rockchatn.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc && cc.length > 0 ? cc.join(', ') : undefined,
      subject: subject,
      html: html,
      text: text
    };

    // Send email using nodemailer
    const info = await emailTransporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    res.json({
      success: true,
      message: 'อีเมลถูกส่งเรียบร้อยแล้ว',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการส่งอีเมล',
      message: error.message 
    });
  }
});

// ---------------- SERVE FRONTEND (PROD) ----------------
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "dist");
  app.use(express.static(buildPath));

  // fallback → index.html (React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ---------------- DELETE ALL DATA ENDPOINTS ----------------

// Delete all movements
app.delete("/api/movements/all", authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM stock_movements');
    res.json({ success: true, message: 'ลบข้อมูลการเคลื่อนไหวทั้งหมดเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting all movements:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลการเคลื่อนไหวได้' });
  }
});

// Delete all products
app.delete("/api/products/all", authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM products');
    res.json({ success: true, message: 'ลบข้อมูลสินค้าทั้งหมดเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting all products:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลสินค้าได้' });
  }
});

// Delete all categories
app.delete("/api/categories/all", authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories');
    res.json({ success: true, message: 'ลบข้อมูลหมวดหมู่ทั้งหมดเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting all categories:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลหมวดหมู่ได้' });
  }
});

// Delete all suppliers
app.delete("/api/suppliers/all", authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM suppliers');
    res.json({ success: true, message: 'ลบข้อมูลซัพพลายเออร์ทั้งหมดเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting all suppliers:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลซัพพลายเออร์ได้' });
  }
});

// ---------------- MONITORING ENDPOINTS ----------------
// Health Check Endpoint
app.get("/health", async (req, res) => {
  try {
    const healthData = await systemMonitoring.checkDatabaseHealth();
    const metrics = await systemMonitoring.getDatabaseMetrics();
    const resources = await systemMonitoring.getSystemResources();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: healthData,
      metrics: metrics,
      resources: resources,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Metrics Endpoint
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await systemMonitoring.getDatabaseMetrics();
    const resources = await systemMonitoring.getSystemResources();
    
    res.json({
      timestamp: new Date().toISOString(),
      database: metrics,
      system: resources,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

// System Status Endpoint
app.get("/status", (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Error Handling Middleware (ต้องอยู่ท้ายสุด)
app.use(errorHandler);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
});
