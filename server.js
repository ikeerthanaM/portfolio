const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
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

// Load initial data into memory so reads/writes NEVER crash with HTTP 500
let store = {
  profile: [{ id: 'prof-1', fullName: 'Keerthana M', handle: 'ikeerthanaM' }],
  education: [],
  interests: [],
  skills: [],
  projects: [],
  achievements: [],
  digitalFootprints: [],
  articles: []
};

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (raw) {
      const parsed = JSON.parse(raw);
      VALID_SECTIONS.forEach((sec) => {
        if (Array.isArray(parsed[sec])) store[sec] = parsed[sec];
      });
    }
  }
} catch (e) {
  console.log('Starting with clean in-memory store:', e.message);
}

function persistToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.log('Disk sync warning (in-memory still saved):', e.message);
  }
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  const pass =
    req.headers['x-admin-password'] ||
    (req.body && req.body._adminPassword) ||
    req.query.password;

  if (!pass || pass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
  }
  if (req.body && req.body._adminPassword) {
    delete req.body._adminPassword;
  }
  next();
}

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/admin/login', (req, res) => {
  if (req.body && req.body.password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

app.get('/api/portfolio', (req, res) => {
  res.json(store);
});

app.get('/api/:section', (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid section.' });
  }
  res.json(store[section]);
});

app.post('/api/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid section.' });
  }
  const newItem = {
    id: `${section.slice(0, 3)}-${Date.now()}`,
    ...req.body
  };
  store[section].push(newItem);
  persistToDisk();
  res.status(201).json(newItem);
});

app.put('/api/:section/:id', requireAdmin, (req, res) => {
  const { section, id } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid section.' });
  }
  const index = store[section].findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  store[section][index] = { ...store[section][index], ...req.body, id };
  persistToDisk();
  res.json(store[section][index]);
});

app.delete('/api/:section/:id', requireAdmin, (req, res) => {
  const { section, id } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(404).json({ error: 'Invalid section.' });
  }
  store[section] = store[section].filter((item) => item.id !== id);
  persistToDisk();
  res.json({ success: true, deletedId: id });
});

app.listen(PORT, () => {
  console.log(`Server v2 running on port ${PORT}`);
});