
const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('./db'); 

const app = express();
const port = 3000;
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.promise().execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
   
  } catch (error) {
    console.error('Error during registration:',error);
    res.status(500).send('Error registering user.');
  }

  res.redirect('/index.html');
});



// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await connection.promise().execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).send('Username not found.');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send('Invalid password.');
    }
   
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during login.');
  }
  res.redirect('/home.html');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
