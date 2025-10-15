Ticket-Hub Backend

Environment
- Copy `.env.example` to `.env` and fill values

Scripts
- `npm run dev` to start with nodemon
- `node src/seed.js` to seed sample data

API
- `GET /api/health`
- `POST /api/auth/register` { name, email, password, role? }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/me` with cookie/Authorization
- `GET /api/events` ?q=&status=upcoming|past
- `POST /api/events` admin only
- `PUT /api/events/:id` admin only
- `DELETE /api/events/:id` admin only
- `GET /api/events/:id`
- `POST /api/tickets/book/:eventId` { seatNumber }
- `GET /api/tickets/mine`
- `POST /api/tickets/checkin/:ticketId`



