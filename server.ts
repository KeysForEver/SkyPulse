import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(__dirname, 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId
  });
} else {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for User Creation/Sync
  app.post('/api/users/sync', async (req: any, res: any) => {
    const { username, password, email: providedEmail } = req.body;
    const email = providedEmail || `${username.toLowerCase().trim()}@skysmart.com`;
    
    try {
      // Check if user already exists in Auth
      try {
        const userRecord = await auth.getUserByEmail(email);
        // If it exists, we might want to update the password if it's a sync
        await auth.updateUser(userRecord.uid, {
          password: password
        });
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          await auth.createUser({
            email,
            password,
            displayName: username
          });
        } else {
          throw err;
        }
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Login Fallback (Check Firestore and create Auth user if valid)
  app.post('/api/auth/fallback', async (req: any, res: any) => {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase().trim();
    const email = `${normalizedUsername}@skysmart.com`;

    try {
      // Query Firestore for this user
      const usersSnap = await db.collection('users')
        .where('username', '==', normalizedUsername)
        .limit(1)
        .get();

      if (usersSnap.empty) {
        return res.status(401).json({ error: 'Usuário não encontrado no banco de dados' });
      }

      const userData = usersSnap.docs[0].data();
      
      // Check password (insecure but matching current app logic)
      if (userData.password !== password) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // User is valid in Firestore, ensure they exist in Auth
      try {
        await auth.getUserByEmail(email);
        // If they exist but login failed, maybe password changed? Update it.
        const userRecord = await auth.getUserByEmail(email);
        await auth.updateUser(userRecord.uid, { password });
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          await auth.createUser({
            email,
            password,
            displayName: userData.name
          });
        } else {
          throw err;
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Auth fallback error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Routes for File Uploads (Still using local storage for now, can be migrated to Firebase Storage later)
  app.post('/api/upload', upload.single('photo'), async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    try {
      const fileName = `photo_${Date.now()}.webp`;
      const filePath = path.join(uploadsDir, fileName);

      await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);

      res.json({ url: `/uploads/${fileName}` });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro ao processar imagem' });
    }
  });

  // Serve uploads folder
  app.use('/uploads', express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
