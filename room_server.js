const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();
console.log("🚨 Loaded MONGO_URI:", process.env.MONGO_URI); 
const Owner = require('./models/owner');
const Room = require('./models/room');
const path = require('path');

const app = express();
const PORT = 3003;

// ✅ Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session setup
app.use(session({
  secret: 'prabhukripa-secret-key',
  resave: false,
  saveUninitialized: false
}));

// ✅ ❌ CSP REMOVED COMPLETELY — no CSP headers will be sent

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB connection
console.log("🚨 MONGO_URI value:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Signup
app.post('/signup', async (req, res) => {
  const { name, email, password, gender } = req.body;
  const existing = await Owner.findOne({ email });
  if (existing) return res.redirect('/owner_signup.html?error=email_exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newOwner = new Owner({ name, email, password: hashedPassword, gender });
  await newOwner.save();

  res.redirect('/login.html');
});

// ✅ Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const owner = await Owner.findOne({ email });

  if (!owner || !(await bcrypt.compare(password, owner.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  req.session.loggedIn = true;
  req.session.owner = { name: owner.name, email: owner.email, gender: owner.gender };
  res.json({ success: true });
});

// ✅ Authenticated routes
app.get('/select_pg.html', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'select_pg.html'));
  } else {
    res.redirect('/login.html');
  }
});

app.get('/dashboard.html', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/login.html');
  }
});

// ✅ Serve login page directly
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// ✅ Get owner info
app.get('/api/owner-info', (req, res) => {
  if (!req.session.loggedIn || !req.session.owner) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.owner);
});

// ✅ Update owner profile
app.post('/api/update-profile', async (req, res) => {
  if (!req.session.loggedIn || !req.session.owner) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { name, email } = req.body;
  const currentEmail = req.session.owner.email;

  const duplicate = await Owner.findOne({ email });
  if (duplicate && duplicate.email !== currentEmail) {
    return res.redirect('/signup.html?error=email');
  }

  const updated = await Owner.findOneAndUpdate(
    { email: currentEmail },
    { name, email },
    { new: true }
  );

  req.session.owner = {
    name: updated.name,
    email: updated.email,
    gender: updated.gender
  };

  res.json({ success: true });
});

// ✅ Password reset
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const owner = await Owner.findOne({ email });

  if (!owner) {
    return res.status(404).json({ success: false, message: 'Email not registered' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  owner.password = hashedPassword;
  await owner.save();

  res.json({ success: true, message: 'Password reset successful' });
});

// ✅ Get rooms for layout
app.get('/api/rooms', async (req, res) => {
  const { pg, floor } = req.query;

  try {
    const rooms = await Room.find({ pg, floor });
    const formatted = rooms.map(r => ({
      room: r.room,
      status: r.status,
      guestName: r.guestName,
      paymentDone: r.paymentDone || 0,
      pendingPayment: r.pendingPayment || 0
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// ✅ Save or update a room
app.post('/api/room', async (req, res) => {
  const { pg, floor, room, data } = req.body;

  if (!pg || !floor || !room || !data) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    await Room.findOneAndUpdate(
      { pg, floor, room },
      { ...data, pg, floor, room, status: 'Booked' },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ✅ Get full room details
app.get('/api/room-details', async (req, res) => {
  const { pg, floor, room } = req.query;

  if (!pg || !floor || !room) {
    return res.status(400).json({ success: false, message: 'Missing query params' });
  }

  try {
    const roomData = await Room.findOne({ pg, floor, room });
    if (!roomData) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room: roomData });
  } catch (error) {
    console.error('❌ Error fetching room details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
