import { Router } from 'express';
import QRCode from 'qrcode';
import { requireAuth } from '../middleware/auth.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';

const router = Router();

// Book a ticket for an event
router.post('/book/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { seatNumber } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const seat = event.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) return res.status(400).json({ message: 'Seat not found' });
    if (seat.isBooked) return res.status(400).json({ message: 'Seat already booked' });

    seat.isBooked = true;
    seat.bookedBy = req.user.id;
    await event.save();

    const payload = { eventId: event._id.toString(), seatNumber, userId: req.user.id };
    const qrCode = await QRCode.toDataURL(JSON.stringify(payload));
    const ticket = await Ticket.create({ event: event._id, user: req.user.id, seatNumber, qrCode, pricePaid: event.price });

    res.status(201).json({ ticket });
  } catch (err) {
    res.status(400).json({ message: 'Booking failed' });
  }
});

// My tickets
router.get('/mine', requireAuth, async (req, res) => {
  const tickets = await Ticket.find({ user: req.user.id }).populate('event');
  res.json({ tickets });
});

// Simple check-in by ticket id
router.post('/checkin/:ticketId', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.status = 'checked-in';
    await ticket.save();
    res.json({ ticket });
  } catch (err) {
    res.status(400).json({ message: 'Check-in failed' });
  }
});

export default router;



