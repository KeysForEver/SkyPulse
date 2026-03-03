import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use caminho absoluto para garantir que o DB fique sempre na pasta do projeto
const dbPath = path.join(__dirname, 'inventory.db');
const db = new Database(dbPath);

// Opcional, mas recomendado para performance/confiabilidade em apps web
try {
  db.pragma('journal_mode = WAL');
} catch {}

// Initialize Database (APENAS SQL aqui dentro)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'un',
    cost_price REAL DEFAULT 0,
    quantity REAL DEFAULT 0,
    min_quantity REAL DEFAULT 5,
    photo TEXT,
    expiry_date TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT
  );

  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'disponivel'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Ordens de Produção',
    client_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    type TEXT CHECK(type IN ('IN', 'OUT')),
    quantity REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    supplier_id INTEGER,
    doc_number TEXT,
    issue_date TEXT,
    location TEXT,
    expiry_date TEXT,
    unit_price REAL,
    reason TEXT,
    destination TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);

// Migrations (para bancos antigos que não tinham colunas)
// Observação: em SQLite não existe "ADD COLUMN IF NOT EXISTS", então usamos try/catch.
try { db.exec("ALTER TABLE products ADD COLUMN code TEXT UNIQUE"); } catch {}
try { db.exec("ALTER TABLE products ADD COLUMN expiry_date TEXT"); } catch {}

// Seed initial data if empty
const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Admin', 'admin@example.com', 'Admin');
  db.prepare('INSERT INTO categories (name) VALUES (?)').run('Cabeamento');
  db.prepare('INSERT INTO categories (name) VALUES (?)').run('Conectores');
  db.prepare('INSERT INTO locations (name) VALUES (?)').run('Almoxarifado Central');
  db.prepare('INSERT INTO locations (name) VALUES (?)').run('Depósito A');
  db.prepare('INSERT INTO products (name, category, quantity, cost_price) VALUES (?, ?, ?, ?)').run('Cabo de Rede CAT6', 'Cabeamento', 100, 2.50);
  db.prepare('INSERT INTO products (name, category, quantity, cost_price) VALUES (?, ?, ?, ?)').run('Conector RJ45', 'Conectores', 500, 0.50);
  db.prepare('INSERT INTO clients (name, email) VALUES (?, ?)').run('Empresa ABC', 'contato@abc.com');
  db.prepare('INSERT INTO suppliers (name, contact) VALUES (?, ?)').run('Fornecedor Tech', 'vendas@tech.com');
  db.prepare('INSERT INTO orders (title, status, client_id) VALUES (?, ?, ?)').run('Instalação Rede Escritório', 'Ordens de Produção', 1);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/movements', (req, res) => {
    try {
      const movements = db.prepare(`
        SELECT m.*, p.name as product_name, s.name as supplier_name
        FROM movements m
        JOIN products p ON m.product_id = p.id
        LEFT JOIN suppliers s ON m.supplier_id = s.id
        ORDER BY m.date DESC
      `).all();
      res.json(movements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/stats', (req, res) => {
    try {
      const totalProducts = db.prepare('SELECT count(*) as count FROM products').get() as any;
      const lowStock = db.prepare('SELECT count(*) as count FROM products WHERE quantity <= min_quantity').get() as any;
      const activeOrders = db.prepare("SELECT count(*) as count FROM orders WHERE status != 'Finalização'").get() as any;
      const recentMovements = db.prepare(`
        SELECT m.*, p.name as product_name
        FROM movements m
        JOIN products p ON m.product_id = p.id
        ORDER BY date DESC
        LIMIT 5
      `).all();

      res.json({
        totalProducts: totalProducts.count,
        lowStock: lowStock.count,
        activeOrders: activeOrders.count,
        recentMovements
      });
    } catch (error: any) {
      console.error('Error in /api/stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM products').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const { name, category, unit, quantity, min_quantity, photo } = req.body;
      const result = db.prepare(`
        INSERT INTO products (name, category, unit, quantity, min_quantity, photo)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, category, unit, quantity, min_quantity, photo);

      res.json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, unit, quantity, min_quantity, photo } = req.body;

      db.prepare(`
        UPDATE products
        SET name = ?, category = ?, unit = ?, quantity = ?, min_quantity = ?, photo = ?
        WHERE id = ?
      `).run(name, category, unit, quantity, min_quantity, photo, id);

      broadcast({ type: 'INVENTORY_UPDATED' });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;

      const movements = db.prepare('SELECT count(*) as count FROM movements WHERE product_id = ?').get(id) as { count: number };
      if (movements.count > 0) {
        return res.status(400).json({ error: 'Não é possível excluir um produto que possui movimentações de estoque.' });
      }

      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      broadcast({ type: 'INVENTORY_UPDATED' });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products/:id/movements', (req, res) => {
    try {
      const { id } = req.params;
      const movements = db.prepare(`
        SELECT m.*, s.name as supplier_name
        FROM movements m
        LEFT JOIN suppliers s ON m.supplier_id = s.id
        WHERE m.product_id = ?
        ORDER BY m.date DESC
      `).all(id);

      res.json(movements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/clients', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM clients').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/suppliers', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM suppliers').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/suppliers', (req, res) => {
    try {
      const { name, contact } = req.body;
      const result = db.prepare('INSERT INTO suppliers (name, contact) VALUES (?, ?)').run(name, contact);
      res.json({ id: result.lastInsertRowid, name, contact });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/locations', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM locations').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/locations', (req, res) => {
    try {
      const { name } = req.body;
      const result = db.prepare('INSERT INTO locations (name) VALUES (?)').run(name);
      res.json({ id: result.lastInsertRowid, name });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/locations/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      db.prepare('UPDATE locations SET name = ? WHERE id = ?').run(name, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/assets', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM assets').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/categories', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM categories').all());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/categories', (req, res) => {
    try {
      const { name } = req.body;
      const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
      res.json({ id: result.lastInsertRowid, name });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/categories/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/inventory/in', (req, res) => {
    const { product_id, quantity, supplier_id, doc_number, issue_date, location, expiry_date, unit_price } = req.body;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO movements (product_id, type, quantity, supplier_id, doc_number, issue_date, location, expiry_date, unit_price)
        VALUES (?, 'IN', ?, ?, ?, ?, ?, ?, ?)
      `).run(product_id, quantity, supplier_id, doc_number, issue_date, location, expiry_date, unit_price);

      db.prepare('UPDATE products SET quantity = quantity + ?, expiry_date = ?, cost_price = ? WHERE id = ?')
        .run(quantity, expiry_date, unit_price, product_id);
    });

    try {
      transaction();
      broadcast({ type: 'INVENTORY_UPDATED' });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/inventory/out', (req, res) => {
    const { product_id, quantity, reason, destination } = req.body;

    try {
      const product = db.prepare('SELECT quantity FROM products WHERE id = ?').get(product_id) as any;
      if (!product || product.quantity < quantity) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }

      const transaction = db.transaction(() => {
        db.prepare(`
          INSERT INTO movements (product_id, type, quantity, reason, destination)
          VALUES (?, 'OUT', ?, ?, ?)
        `).run(product_id, quantity, reason, destination);

        db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?')
          .run(quantity, product_id);
      });

      transaction();
      broadcast({ type: 'INVENTORY_UPDATED' });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders', (req, res) => {
    try {
      res.json(
        db.prepare('SELECT o.*, c.name as client_name FROM orders o LEFT JOIN clients c ON o.client_id = c.id').all()
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/orders/:id', (req, res) => {
    try {
      const { status } = req.body;
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
      broadcast({ type: 'ORDER_UPDATED', id: req.params.id, status });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

startServer();
