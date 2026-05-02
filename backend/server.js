import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

if (!dbConfig.host && !isProduction) {
  dbConfig.host = "localhost";
  dbConfig.user = "root";
  dbConfig.password = "";
  dbConfig.database = "store_system_db";
}

if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
  console.error("❌ Missing database environment variables.");
  console.error("Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT");
}

if (process.env.DB_SSL === "true") {
  dbConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  };
}

const pool = mysql.createPool(dbConfig);

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_connected");
    res.json({
      status: "OK",
      service: "Inventory API",
      database: "connected",
      dbHost: dbConfig.host,
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      service: "Inventory API",
      database: "failed",
      message: error.message,
    });
  }
});

// ----------------- USERS API -----------------
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { id, username, password, role, name } = req.body;
    await pool.query(
      "INSERT INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)",
      [id, username, password, role, name]
    );
    res.json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- CUSTOMERS API -----------------
app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers");
    res.json(rows.map(c => ({
      ...c,
      ownerId: c.owner_id,
      createdAt: c.created_at,
      debt: parseFloat(c.debt) || 0,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { id, name, phone, email, debt, notes, ownerId } = req.body;
    await pool.query(`
      INSERT INTO customers (id, name, phone, email, debt, notes, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      phone = VALUES(phone),
      email = VALUES(email),
      debt = VALUES(debt),
      notes = VALUES(notes)
    `, [id, name, phone, email, debt || 0, notes, ownerId]);

    res.json({ message: "Customer saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/customers/:id/debt", async (req, res) => {
  try {
    const { debt, addPurchase } = req.body;
    let query = "UPDATE customers SET debt = ?";
    const params = [debt];

    if (addPurchase) {
      query += ", totalPurchases = totalPurchases + 1";
    }

    query += " WHERE id = ?";
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ message: "Customer debt updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- PRODUCTS API -----------------
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows.map(p => ({
      ...p,
      ownerId: p.owner_id,
      createdAt: p.created_at,
      price: parseFloat(p.price),
      cost: parseFloat(p.cost) || 0,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { id, name, category, price, cost, stock, ownerId } = req.body;

    await pool.query(`
      INSERT INTO products (id, name, category, price, cost, stock, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      category = VALUES(category),
      price = VALUES(price),
      cost = VALUES(cost),
      stock = VALUES(stock)
    `, [id, name, category, price, cost || 0, stock, ownerId]);

    res.json({ message: "Product saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/products/bulk-stock", async (req, res) => {
  const { updates } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of updates) {
      await connection.query(
        "UPDATE products SET stock = ? WHERE id = ?",
        [item.newStock, item.id]
      );
    }

    await connection.commit();
    res.json({ message: "Stock updated" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ----------------- TRANSACTIONS API -----------------
app.get("/api/transactions", async (req, res) => {
  try {
    const [transactions] = await pool.query("SELECT * FROM transactions ORDER BY date DESC");
    const [items] = await pool.query("SELECT * FROM transaction_items");

    const result = transactions.map(tx => {
      const txItems = items
        .filter(item => item.transaction_id === tx.id)
        .map(i => ({
          productId: i.product_id,
          name: i.name,
          quantity: i.quantity,
          price: parseFloat(i.price),
        }));

      return {
        ...tx,
        customerId: tx.customer_id,
        customerName: tx.customer_name,
        customId: tx.custom_id,
        ownerId: tx.owner_id,
        paymentMethod: tx.payment_method,
        amount: parseFloat(tx.amount),
        total: parseFloat(tx.total),
        subtotal: parseFloat(tx.subtotal),
        discount: parseFloat(tx.discount),
        items: txItems,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  const {
    id,
    type,
    amount,
    total,
    subtotal,
    discount,
    paymentMethod,
    customerId,
    customerName,
    customId,
    ownerId,
    items,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO transactions
      (id, type, amount, total, subtotal, discount, payment_method, customer_id, customer_name, custom_id, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      type,
      amount || 0,
      total || 0,
      subtotal || 0,
      discount || 0,
      paymentMethod,
      customerId,
      customerName,
      customId,
      ownerId,
    ]);

    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(`
          INSERT INTO transaction_items
          (transaction_id, product_id, name, quantity, price)
          VALUES (?, ?, ?, ?, ?)
        `, [id, item.productId, item.name, item.quantity, item.price]);
      }
    }

    await connection.commit();
    res.json({ message: "Transaction created" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id = ?", [req.params.id]);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- STORE PROFILES API -----------------
app.get("/api/store_profiles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM store_profiles LIMIT 1");
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/store_profiles", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      address,
      phone,
      receiptSize,
      taxNumber,
      receiptFooter,
      showCashier,
    } = req.body;

    await connection.beginTransaction();
    await connection.query("DELETE FROM store_profiles");

    await connection.query(`
      INSERT INTO store_profiles
      (user_id, name, address, phone, receiptSize, taxNumber, receiptFooter, showCashier)
      VALUES ('global', ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      address || null,
      phone || null,
      receiptSize || "80mm",
      taxNumber || null,
      receiptFooter || null,
      showCashier || "yes",
    ]);

    await connection.commit();
    res.json({ message: "Profile updated and old ones deleted" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
