
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: 'database-1.chmu6usqi5ms.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Arpan12345',
  database: 'myapp'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Serve registration form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle user registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.send('Username already exists!');
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(insertQuery, [username, hash], (err, result) => {
          if (err) throw err;
          res.send('User registered successfully!');
        });
      });
    }
  });
});

// Serve login form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          res.send('Login successful!');
        } else {
          res.send('Incorrect password!');
        }
      });
    } else {
      res.send('User not found!');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
