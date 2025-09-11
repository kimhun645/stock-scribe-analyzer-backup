import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// CORS configuration - Allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Firebase admin init
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "stock-6e930"
  });
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error);
  process.exit(1);
}

const db = admin.firestore();

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Get all products (NO AUTH)
app.get("/api/products", async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json({ products });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get all budget requests (NO AUTH)
app.get("/api/budget-requests", async (req, res) => {
  try {
    const budgetRequestsSnapshot = await db.collection('budgetRequests').get();
    const budgetRequests = [];
    budgetRequestsSnapshot.forEach(doc => {
      budgetRequests.push({ id: doc.id, ...doc.data() });
    });
    res.json({ budgetRequests });
  } catch (error) {
    console.error('Error getting budget requests:', error);
    res.status(500).json({ error: 'Failed to get budget requests' });
  }
});

// Get all stock movements (NO AUTH)
app.get("/api/stock-movements", async (req, res) => {
  try {
    const movementsSnapshot = await db.collection('movements').get();
    const movements = [];
    movementsSnapshot.forEach(doc => {
      movements.push({ id: doc.id, ...doc.data() });
    });
    res.json({ movements });
  } catch (error) {
    console.error('Error getting movements:', error);
    res.status(500).json({ error: 'Failed to get movements' });
  }
});

// Get all categories (NO AUTH)
app.get("/api/categories", async (req, res) => {
  try {
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = [];
    categoriesSnapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    res.json({ categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get all suppliers (NO AUTH)
app.get("/api/suppliers", async (req, res) => {
  try {
    const suppliersSnapshot = await db.collection('suppliers').get();
    const suppliers = [];
    suppliersSnapshot.forEach(doc => {
      suppliers.push({ id: doc.id, ...doc.data() });
    });
    res.json({ suppliers });
  } catch (error) {
    console.error('Error getting suppliers:', error);
    res.status(500).json({ error: 'Failed to get suppliers' });
  }
});

// Get all account codes (NO AUTH)
app.get("/api/account-codes", async (req, res) => {
  try {
    const accountCodesSnapshot = await db.collection('accountCodes').get();
    const accountCodes = [];
    accountCodesSnapshot.forEach(doc => {
      accountCodes.push({ id: doc.id, ...doc.data() });
    });
    res.json({ accountCodes });
  } catch (error) {
    console.error('Error getting account codes:', error);
    res.status(500).json({ error: 'Failed to get account codes' });
  }
});

// Get all requesters (NO AUTH)
app.get("/api/requesters", async (req, res) => {
  try {
    const requestersSnapshot = await db.collection('requesters').get();
    const requesters = [];
    requestersSnapshot.forEach(doc => {
      requesters.push({ id: doc.id, ...doc.data() });
    });
    res.json({ requesters });
  } catch (error) {
    console.error('Error getting requesters:', error);
    res.status(500).json({ error: 'Failed to get requesters' });
  }
});

// Get all approvers (NO AUTH)
app.get("/api/approvers", async (req, res) => {
  try {
    const approversSnapshot = await db.collection('approvers').get();
    const approvers = [];
    approversSnapshot.forEach(doc => {
      approvers.push({ id: doc.id, ...doc.data() });
    });
    res.json({ approvers });
  } catch (error) {
    console.error('Error getting approvers:', error);
    res.status(500).json({ error: 'Failed to get approvers' });
  }
});

// Get all approvals (NO AUTH)
app.get("/api/approvals", async (req, res) => {
  try {
    const approvalsSnapshot = await db.collection('approvals').get();
    const approvals = [];
    approvalsSnapshot.forEach(doc => {
      approvals.push({ id: doc.id, ...doc.data() });
    });
    res.json({ approvals });
  } catch (error) {
    console.error('Error getting approvals:', error);
    res.status(500).json({ error: 'Failed to get approvals' });
  }
});

// Get all settings (NO AUTH)
app.get("/api/settings", async (req, res) => {
  try {
    const settingsSnapshot = await db.collection('settings').get();
    const settings = [];
    settingsSnapshot.forEach(doc => {
      settings.push({ id: doc.id, ...doc.data() });
    });
    res.json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
