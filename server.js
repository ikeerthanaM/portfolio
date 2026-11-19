const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Change this password or set ADMIN_PASSWORD in your hosting environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ocean123';

const VALID_SECTIONS = [
  'profile',
  'education',
  'interests',
  'skills',
  'projects',
  'achievements',
  'digitalFootprints',
  'articles'
];

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions to read/write JSON safely
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Middleware to protect Admin write routes
function requireAdmin(req, res, next) {
  const authHeader = req.headers['x-admin-password'];
  if (!authHeader || authHeader !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
  }
  next();
}

// Route for Admin Dashboard page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Verify admin password endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// GET all portfolio data (Public)
app.get('/api/portfolio', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read portfolio data.' });
  }
});

// GET single section (Public)
app.get('/api/:section', (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid portfolio section.' });
  }
  try {
    const data = readData();
    res.json(data[section]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read section data.' });
  }
});

// POST new item to a section (Admin Protected)
app.post('/api/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid portfolio section.' });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty.' });
  }

  try {
    const data = readData();
    const newItem = {
      id: `${section.slice(0, 3)}-${Date.now()}`,
      ...req.body
    };
    data[section].push(newItem);
    writeData(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save new item.' });
  }
});

// PUT update existing item in a section (Admin Protected)
app.put('/api/:section/:id', requireAdmin, (req, res) => {
  const { section, id } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid portfolio section.' });
  }

  try {
    const data = readData();
    const index = data[section].findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    data[section][index] = { ...data[section][index], ...req.body, id };
    writeData(data);
    res.json(data[section][index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

// DELETE item from a section (Admin Protected)
app.delete('/api/:section/:id', requireAdmin, (req, res) => {
  const { section, id } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid portfolio section.' });
  }

  try {
    const data = readData();
    const initialLength = data[section].length;
    data[section] = data[section].filter((item) => item.id !== id);
    if (data[section].length === initialLength) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    writeData(data);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin (Default password: ${ADMIN_PASSWORD})`);
});