import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seatNumber: { type: String, required: true },
    qrCode: { type: String, required: true },
    pricePaid: { type: Number, required: true },
    status: { type: String, enum: ['booked', 'checked-in', 'cancelled'], default: 'booked' }
  },
  { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;



