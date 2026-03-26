import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required.' });

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid username or password.' });

  // Return safe officer object (no password)
  res.json({ id: user._id, name: user.name, role: user.role });
});

export default router;
