const mysql = require('mysql2');
const dotenv = require('dotenv');
const { setConnected } = require('./lib/dbStatus');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'project',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    console.warn('Running in OFFLINE mode — auth uses local file storage.');
    console.warn('Update DB_PASSWORD in backend/.env to connect MySQL for full features.');
    setConnected(false);
    return;
  }
  setConnected(true);
  console.log('Connected to MySQL database');
});

module.exports = db;
