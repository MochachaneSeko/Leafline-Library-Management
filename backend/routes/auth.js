import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { membershipId, password } = req.body;
    if (!membershipId || !password) return res.status(400).json({ message: 'Membership ID and password are required.' });
    const [rows] = await db.query('SELECT id, name, membership_id, password_hash, role FROM users WHERE membership_id = ?', [membershipId.trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect membership ID or password.' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role },
      process.env.JWT_SECRET || 'development_secret_change_me',
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role } });
  } catch (error) { next(error); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
export default router;
