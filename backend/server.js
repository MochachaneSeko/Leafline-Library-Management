import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from './db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import transactionRoutes from './routes/transactions.js';
import userRoutes from './routes/users.js';

dotenv.config();
const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Library Management API' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'A server error occurred. Check the backend terminal and database connection.' });
});

const port = process.env.PORT || 5000;
try {
  await db.query('SELECT 1');
  const [admins] = await db.query('SELECT id FROM users WHERE membership_id=?', ['ADMIN001']);
  if (!admins.length) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await db.query(
      'INSERT INTO users (name, membership_id, password_hash, role) VALUES (?, ?, ?, ?)',
      ['System Administrator', 'ADMIN001', hash, 'admin']
    );
    console.log('Created demo administrator: ADMIN001 / Admin123!');
  }
  app.listen(port, () => console.log(`Library API running at http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MySQL. Check backend/.env and run backend/database/schema.sql first.', error.message);
  process.exit(1);
}
