import { Router } from 'express';
import db from '../db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.transaction_type, t.quantity, t.note, t.created_at,
             b.title AS book_title, u.name AS user_name, u.membership_id
      FROM transactions t
      JOIN books b ON b.id=t.book_id
      LEFT JOIN users u ON u.id=t.user_id
      ORDER BY t.created_at DESC, t.id DESC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', adminOnly, async (req, res, next) => {
  const { bookId, type, quantity, note = '', userId = null } = req.body;
  const amount = Number(quantity);
  if (!bookId || !['stock_in', 'borrow'].includes(type) || !Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({ message: 'Choose a book, transaction type, and a quantity of at least one.' });
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [books] = await connection.query('SELECT id, quantity FROM books WHERE id=? FOR UPDATE', [bookId]);
    if (!books.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found.' });
    }
    const current = books[0].quantity;
    if (type === 'borrow' && amount > current) {
      await connection.rollback();
      return res.status(400).json({ message: `Only ${current} copies are currently available.` });
    }
    if (type === 'borrow' && userId) {
      const [users] = await connection.query('SELECT id FROM users WHERE id=?', [userId]);
      if (!users.length) {
        await connection.rollback();
        return res.status(400).json({ message: 'Selected member was not found.' });
      }
    }
    const change = type === 'stock_in' ? amount : -amount;
    await connection.query('UPDATE books SET quantity=quantity+? WHERE id=?', [change, bookId]);
    await connection.query(
      'INSERT INTO transactions (book_id, user_id, transaction_type, quantity, note) VALUES (?, ?, ?, ?, ?)',
      [bookId, userId || req.user.id, type, amount, String(note).slice(0, 255)]
    );
    await connection.commit();
    res.status(201).json({ message: 'Transaction recorded and stock updated.' });
  } catch (e) {
    await connection.rollback();
    next(e);
  } finally { connection.release(); }
});
export default router;
