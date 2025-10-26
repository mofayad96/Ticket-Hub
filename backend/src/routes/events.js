import { Router } from 'express';
import Event from '../models/Event.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public list (with filters)
router.get('/', async (req, res) => {
  const { q, status } = req.query;
  const now = new Date();
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (status === 'upcoming') filter.date = { $gte: now };
  if (status === 'past') filter.date = { $lt: now };
  const events = await Event.find(filter).sort({ date: 1 });
  res.json({ events });
});

// Admin create
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, date, venue, price, totalSeats } = req.body;
    const seats = Array.from({ length: totalSeats }).map((_, i) => ({ seatNumber: `S${i + 1}` }));
    const event = await Event.create({ title, description, date, venue, price, totalSeats, seats, createdBy: req.user.id });
    res.status(201).json({ event });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create event' });
  }
});

// Admin update
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const event = await Event.findByIdAndUpdate(id, update, { new: true });
    res.json({ event });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update event' });
  }
});

// Admin delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete event' });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Not found' });
  res.json({ event });
});

export default router;



