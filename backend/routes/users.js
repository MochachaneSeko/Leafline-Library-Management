import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, name, membership_id AS membershipId, role, created_at AS createdAt FROM users ORDER BY name');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, membershipId, password, role = 'member' } = req.body;
    if (!name?.trim() || !membershipId?.trim() || !password || password.length < 6 || !['admin','member'].includes(role)) {
      return res.status(400).json({ message: 'Enter a name, membership ID, password (at least 6 characters), and valid role.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), membershipId.trim(), hash, role]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), membershipId: membershipId.trim(), role });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID is already in use.' });
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (!name?.trim() || !membershipId?.trim() || !['admin','member'].includes(role)) return res.status(400).json({ message: 'Name, membership ID, and a valid role are required.' });
    if (Number(req.params.id) === req.user.id && role !== 'admin') return res.status(400).json({ message: 'You cannot remove your own administrator role.' });
    if (password && password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET name=?, membership_id=?, role=?, password_hash=? WHERE id=?',
        [name.trim(), membershipId.trim(), role, hash, req.params.id]);
    } else {
      await db.query('UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
        [name.trim(), membershipId.trim(), role, req.params.id]);
    }
    const [rows] = await db.query('SELECT id, name, membership_id AS membershipId, role FROM users WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID is already in use.' });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'You cannot delete the account you are currently using.' });
    const [result] = await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (e) { next(e); }
});
export default router;
