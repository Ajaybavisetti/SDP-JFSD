const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "yourpassword",
  database: "HandiCrafts"
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Registration API
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(password, 8);

  const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error registering user" });
    }
    res.status(200).json({ message: "User registered successfully" });
  });
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error fetching user" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    // Compare the hashed password with the entered password
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user: { id: user.id, email: user.email, username: user.username } });
  });
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
