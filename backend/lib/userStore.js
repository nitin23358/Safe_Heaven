const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    const demoHash = bcrypt.hashSync('demo123', 10);
    const seed = [
      {
        id: 1,
        name: 'Demo User',
        email: 'demo@safehaven.com',
        password: demoHash,
        role: 'Regular',
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function register(name, email, password) {
  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const err = new Error('User already exists');
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    password: hashedPassword,
    role: 'Regular',
  };
  users.push(newUser);
  writeUsers(users);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}

async function login(email, password) {
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { register, login };
