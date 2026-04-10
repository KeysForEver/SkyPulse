import Database from 'better-sqlite3';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const configPath = path.join(__dirname, 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('firebase-applet-config.json not found');
  process.exit(1);
}
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize SQLite
const dbPath = path.join(__dirname, 'inventory.db');
if (!fs.existsSync(dbPath)) {
  console.error('inventory.db not found');
  process.exit(1);
}
const sqlite = new Database(dbPath);

async function migrate() {
  console.log('Starting migration...');

  const tables = [
    'users', 'products', 'clients', 'suppliers', 'assets', 
    'orders', 'movements', 'categories', 'locations', 'units'
  ];

  for (const table of tables) {
    console.log(`Migrating table: ${table}`);
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    
    for (const row of rows) {
      const data = { ...(row as any) };
      const id = data.id;
      delete data.id;

      // Convert dates to Timestamps if needed
      if (data.created_at) data.created_at = Timestamp.fromDate(new Date(data.created_at));
      if (data.date) data.date = Timestamp.fromDate(new Date(data.date));
      if (data.issue_date) data.issue_date = Timestamp.fromDate(new Date(data.issue_date));
      if (data.purchase_date) data.purchase_date = Timestamp.fromDate(new Date(data.purchase_date));
      if (data.disposal_date) data.disposal_date = Timestamp.fromDate(new Date(data.disposal_date));

      try {
        // We can keep the same IDs if we want, or let Firestore generate them.
        // Keeping them might help with foreign keys.
        await setDoc(doc(db, table, id.toString()), data);
      } catch (err) {
        console.error(`Error migrating row ${id} from ${table}:`, err);
      }
    }
  }

  console.log('Migration completed!');
  process.exit(0);
}

migrate();
