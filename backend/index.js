import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendPasswordResetEmail } from './mailer.js';
import crypto from 'crypto';
import twilio from 'twilio';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Helper: JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- CUSTOMER AUTH ---
app.post('/api/customer/register', async (req, res) => {
  const { fullName, email, password, contactNumber } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO customers (full_name, email, password_hash, contact_number) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, contact_number',
      [fullName, email, hash, contactNumber]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.detail || err.message });
  }
});


app.post('/api/customer/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, type: 'customer' }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email } });
});

// --- CUSTOMER PROFILE ---
app.get('/api/customer/me', authenticateToken, async (req, res) => {
  if (req.user.type !== 'customer') return res.sendStatus(403);
  const result = await pool.query(
    'SELECT id, full_name, email FROM customers WHERE id = $1',
    [req.user.id]
  );
  if (!result.rows[0]) return res.sendStatus(404);
  const user = result.rows[0];
  res.json({
    id: user.id,
    fullName: user.full_name,
    email: user.email
  });
});

// --- ASSIGNEE AUTH ---
app.post('/api/assignee/register', async (req, res) => {
  const { fullName, email, password, contactNumber, address } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO assignees (full_name, email, password_hash, contact_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, contact_number, address',
      [fullName, email, hash, contactNumber, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.detail || err.message });
  }
});

app.post('/api/assignee/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM assignees WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, type: 'assignee' }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email } });
});

// Get logged-in assignee's info
app.get('/api/assignee/me', authenticateToken, async (req, res) => {
  if (req.user.type !== 'assignee') return res.sendStatus(403);
  const result = await pool.query(
    'SELECT id, full_name, email, contact_number, address FROM assignees WHERE id = $1',
    [req.user.id]
  );
  if (!result.rows[0]) return res.sendStatus(404);
  const user = result.rows[0];
  res.json({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    contactNumber: user.contact_number,
    address: user.address
  });
});

// --- TICKETS ---
app.get('/api/assignee/tickets', authenticateToken, async (req, res) => {
  if (req.user.type !== 'assignee') return res.sendStatus(403);
  const result = await pool.query(
    'SELECT * FROM tickets WHERE assignee_id = $1',
    [req.user.id]
  );
  res.json(result.rows);
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post('/api/tickets', authenticateToken, async (req, res) => {
  if (req.user.type !== 'customer') return res.sendStatus(403);
  const { title, description, priority, category, assigneeId } = req.body;
  const result = await pool.query(
    'INSERT INTO tickets (title, description, priority, category, customer_id, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, priority, category, req.user.id, assigneeId]
  );
  const ticket = result.rows[0];

  // Fetch assignee details
  const assigneeResult = await pool.query(
    'SELECT full_name, contact_number FROM assignees WHERE id = $1',
    [ticket.assignee_id]
  );
  const assignee = assigneeResult.rows[0];

  // Fetch customer details (including contact number)
  const customerResult = await pool.query(
    'SELECT full_name, contact_number FROM customers WHERE id = $1',
    [ticket.customer_id]
  );
  const customer = customerResult.rows[0];

  // WhatsApp message template
  const message = `New Ticket Created!\nID: ${ticket.id}\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}\nCategory: ${ticket.category}\nCustomer: ${customer ? customer.full_name : 'N/A'}\nAssignee: ${assignee ? assignee.full_name : 'N/A'}\nAssignee Contact: ${assignee ? assignee.contact_number : 'N/A'}`;

  client.messages
    .create({
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: `whatsapp:${customer ? customer.contact_number : ''}`,
      body: message
    })
    .then(message => console.log('WhatsApp message sent:', message.sid))
    .catch(err => console.error('WhatsApp error:', err));

  res.json(ticket);
});

app.patch('/api/tickets/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;
  // Only allow assignee to change status
  const ticketResult = await pool.query('SELECT assignee_id FROM tickets WHERE id = $1', [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.type !== 'assignee' || ticket.assignee_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (newStatus === 'Resolved') {
    await pool.query(
      'UPDATE tickets SET status = $1, resolved_at = NOW() WHERE id = $2',
      [newStatus, id]
    );
  } else {
    await pool.query(
      'UPDATE tickets SET status = $1 WHERE id = $2',
      [newStatus, id]
    );
  }
  res.json({ success: true });
});

// --- GET COMMENTS FOR A TICKET (restricted) ---
app.get('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  // Fetch the ticket to check ownership/assignment
  const ticketResult = await pool.query('SELECT customer_id, assignee_id FROM tickets WHERE id = $1', [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'You are not authorized to view this ticket.' });
  // Only allow the ticket owner or assigned assignee to view comments
  if (
    (req.user.type === 'customer' && ticket.customer_id !== req.user.id) ||
    (req.user.type === 'assignee' && ticket.assignee_id !== req.user.id)
  ) {
    return res.status(403).json({ error: 'You are not authorized to view comments for this ticket.' });
  }
  const result = await pool.query(`
    SELECT c.*, cu.full_name AS customer_name, a.full_name AS assignee_name
    FROM comments c
    LEFT JOIN customers cu ON c.customer_id = cu.id
    LEFT JOIN assignees a ON c.assignee_id = a.id
    WHERE c.ticket_id = $1
    ORDER BY c.created_at ASC
  `, [id]);
  res.json(result.rows.map(row => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    author: row.customer_name || row.assignee_name || 'Unknown',
    authorType: row.customer_id ? 'customer' : (row.assignee_id ? 'assignee' : 'unknown')
  })));
});

// --- ADD COMMENT TO A TICKET (restricted) ---
app.post('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  // Fetch the ticket to check ownership/assignment
  const ticketResult = await pool.query('SELECT customer_id, assignee_id FROM tickets WHERE id = $1', [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'You are not the owner of this ticket.' });
  let query, params;
  if (req.user.type === 'customer') {
    if (ticket.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not the owner of this ticket.' });
    }
    query = 'INSERT INTO comments (ticket_id, customer_id, content) VALUES ($1, $2, $3) RETURNING *';
    params = [id, req.user.id, content];
  } else if (req.user.type === 'assignee') {
    if (ticket.assignee_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this ticket.' });
    }
    query = 'INSERT INTO comments (ticket_id, assignee_id, content) VALUES ($1, $2, $3) RETURNING *';
    params = [id, req.user.id, content];
  } else {
    return res.status(403).json({ error: 'Not allowed' });
  }
  const result = await pool.query(query, params);
  res.json(result.rows[0]);
});

// Dashboard summary
app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
  const totalTickets = await pool.query('SELECT COUNT(*) FROM tickets');
  const openTickets = await pool.query("SELECT COUNT(*) FROM tickets WHERE status = 'Open'");
  const resolvedToday = await pool.query(
    "SELECT COUNT(*) FROM tickets WHERE status = 'Resolved' AND DATE(resolved_at) = CURRENT_DATE"
  );
  const totalCustomers = await pool.query('SELECT COUNT(*) FROM customers');
  res.json({
    totalTickets: totalTickets.rows[0].count,
    openTickets: openTickets.rows[0].count,
    resolvedToday: resolvedToday.rows[0].count,
    totalCustomers: totalCustomers.rows[0].count,
  });
});

// Recent tickets
app.get('/api/dashboard/recent-tickets', authenticateToken, async (req, res) => {
  const recent = await pool.query(
    'SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5'
  );
  res.json(recent.rows);
});

// Tickets by month
app.get('/api/dashboard/tickets-by-month', authenticateToken, async (req, res) => {
  const byMonth = await pool.query(`
    SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) 
    FROM tickets 
    GROUP BY month 
    ORDER BY month
  `);
  res.json(byMonth.rows);
});

// Tickets by priority
app.get('/api/dashboard/tickets-by-priority', authenticateToken, async (req, res) => {
  const byPriority = await pool.query(`
    SELECT priority, COUNT(*) 
    FROM tickets 
    GROUP BY priority
  `);
  res.json(byPriority.rows);
});

// Average response time per day of week (in hours)
app.get('/api/dashboard/average-response-time', async (req, res) => {
  const result = await pool.query(`
    SELECT
      TO_CHAR(created_at, 'Dy') AS day,
      EXTRACT(DOW FROM created_at) AS day_num,
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours
    FROM tickets
    WHERE status = 'Resolved' AND resolved_at IS NOT NULL
    GROUP BY day, day_num
    ORDER BY day_num
  `);
  res.json(result.rows.map(r => ({
    day: r.day,
    avgHours: parseFloat(r.avg_hours)
  })));
});

// Get all assignees (with full details)
app.get('/api/assignees', async (req, res) => {
  const result = await pool.query(
    'SELECT id, full_name, email, contact_number, address, created_at FROM assignees ORDER BY full_name'
  );
  res.json(result.rows.map(a => ({
    id: a.id,
    name: a.full_name,
    email: a.email,
    contact_number: a.contact_number,
    address: a.address,
    created_at: a.created_at
  })));
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json(result.rows.map(c => ({
      id: c.id,
      name: c.full_name,
      email: c.email,
      createdAt: c.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets (with customer info)
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.full_name AS customer_name, c.email AS customer_email
       FROM tickets t
       JOIN customers c ON t.customer_id = c.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      category: t.category,
      createdAt: t.created_at,
      customerName: t.customer_name,
      customerEmail: t.customer_email,
      assigneeId: t.assignee_id,
      resolvedAt: t.resolved_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ASSIGNEE PROFILE UPDATE ---
app.patch('/api/assignee/update', authenticateToken, async (req, res) => {
  if (req.user.type !== 'assignee') return res.sendStatus(403);
  const { fullName, email, password, contactNumber, address } = req.body;
  let query = 'UPDATE assignees SET full_name = $1, email = $2, contact_number = $3, address = $4';
  let params = [fullName, email, contactNumber, address, req.user.id];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    query += ', password_hash = $5 WHERE id = $6 RETURNING id, full_name, email, contact_number, address';
    params = [fullName, email, contactNumber, address, hash, req.user.id];
  } else {
    query += ' WHERE id = $5 RETURNING id, full_name, email, contact_number, address';
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.detail || err.message });
  }
});

// --- CUSTOMER TICKET HISTORY ---
app.get('/api/customers/:id/tickets', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (req.user.type !== 'customer' && req.user.type !== 'admin') return res.sendStatus(403);
  if (req.user.type === 'customer' && req.user.id != id) return res.sendStatus(403);
  try {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.detail || err.message });
  }
});

// --- TICKET ATTACHMENT UPLOAD ---
app.post('/api/tickets/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Only allow ticket owner or assignee to upload
  const ticketResult = await pool.query('SELECT customer_id, assignee_id FROM tickets WHERE id = $1', [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (
    (req.user.type === 'customer' && ticket.customer_id !== req.user.id) &&
    (req.user.type === 'assignee' && ticket.assignee_id !== req.user.id)
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  // Save file metadata (you may want to create a ticket_attachments table)
  await pool.query(
    'INSERT INTO ticket_attachments (ticket_id, filename, originalname, mimetype, size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.user.id]
  );
  res.json({ success: true, filename: req.file.filename });
});

// --- COMMENT ATTACHMENT UPLOAD ---
app.post('/api/comments/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Only allow comment author to upload
  const commentResult = await pool.query('SELECT customer_id, assignee_id FROM comments WHERE id = $1', [id]);
  const comment = commentResult.rows[0];
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (
    (req.user.type === 'customer' && comment.customer_id !== req.user.id) &&
    (req.user.type === 'assignee' && comment.assignee_id !== req.user.id)
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  // Save file metadata (you may want to create a comment_attachments table)
  await pool.query(
    'INSERT INTO comment_attachments (comment_id, filename, originalname, mimetype, size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.user.id]
  );
  res.json({ success: true, filename: req.file.filename });
});

// --- GET TICKET ATTACHMENTS ---
app.get('/api/tickets/:id/attachments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  // Only allow ticket owner or assignee to view
  const ticketResult = await pool.query('SELECT customer_id, assignee_id FROM tickets WHERE id = $1', [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (
    (req.user.type === 'customer' && ticket.customer_id !== req.user.id) &&
    (req.user.type === 'assignee' && ticket.assignee_id !== req.user.id)
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const result = await pool.query('SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY uploaded_at ASC', [id]);
  res.json(result.rows);
});

// --- GET COMMENT ATTACHMENTS ---
app.get('/api/comments/:id/attachments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  // Only allow comment author, ticket owner, or assigned assignee to view
  const commentResult = await pool.query('SELECT customer_id, assignee_id, ticket_id FROM comments WHERE id = $1', [id]);
  const comment = commentResult.rows[0];
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const ticketResult = await pool.query('SELECT customer_id, assignee_id FROM tickets WHERE id = $1', [comment.ticket_id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (
    (req.user.type === 'customer' && ticket.customer_id !== req.user.id) &&
    (req.user.type === 'assignee' && ticket.assignee_id !== req.user.id)
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const result = await pool.query('SELECT * FROM comment_attachments WHERE comment_id = $1 ORDER BY uploaded_at ASC', [id]);
  res.json(result.rows);
});

// --- SERVE UPLOADED FILES ---
app.use('/uploads', express.static(uploadDir));

// --- PASSWORD RESET: FORGOT PASSWORD ---
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  let customer;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    if (!result.rows.length) {
      // Always respond with success to prevent email enumeration
      return res.json({ message: 'If your email exists, you will receive a reset link.' });
    }
    customer = result.rows[0];
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  try {
    await pool.query(
      'INSERT INTO password_resets (customer_id, token, expires_at) VALUES ($1, $2, $3)',
      [customer.id, token, expiresAt]
    );
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  const resetLink = `http://192.168.1.32:8080/reset-password?token=${token}`;
  try {
    await sendPasswordResetEmail(email, resetLink);
    console.log('Reset email sent to:', email, 'with link:', resetLink);
  } catch (err) {
    console.error('Error sending reset email:', err);
  }

  res.json({ message: 'If your email exists, you will receive a reset link.' });
});

// --- PASSWORD RESET: RESET PASSWORD ---
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  // 1. Find the password reset entry
  let resetEntry;
  try {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    resetEntry = result.rows[0];
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  // 2. Hash the new password
  const hash = await bcrypt.hash(newPassword, 10);

  // 3. Update the customer's password
  try {
    await pool.query(
      'UPDATE customers SET password_hash = $1 WHERE id = $2',
      [hash, resetEntry.customer_id]
    );
    // 4. Delete the password reset entry
    await pool.query('DELETE FROM password_resets WHERE id = $1', [resetEntry.id]);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

  res.json({ message: 'Password has been reset successfully.' });
});

app.listen(4000, () => console.log('API running on http://localhost:4000')); 