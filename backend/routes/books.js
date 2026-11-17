import { Router } from 'express';
import db from '../db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', adminOnly, async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (![title, author, genre, isbn].every(v => String(v || '').trim()) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: 'Enter all book details and a quantity of zero or more.' });
    }

    
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A book with this ISBN already exists.' });
    next(e);
  }
});

router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { title, author, genre, isbn } = req.body;
    if (![title, author, genre, isbn].every(v => String(v || '').trim())) return res.status(400).json({ message: 'All book fields are required.' });
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=? WHERE id=?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    const [rows] = await db.query('SELECT * FROM books WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That ISBN is already assigned to another book.' });
    next(e);
  }
});

router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book deleted.' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'This book has transaction history and cannot be deleted.' });
    next(e);
  }
});
export default router;
