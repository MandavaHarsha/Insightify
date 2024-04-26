const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection setup
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'login' // Your database name
});

// Check database connection
pool.query('SELECT 1', (error, results, fields) => {
    if (error) {
        console.error('Error connecting to database:', error);
    } else {
        console.log('Connected to database successfully');
    }
});

// Middleware for parsing JSON requests
app.use(bodyParser.json());
app.use(cors());

// SMTP Configuration for Gmail 
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: '', // Your Gmail email address
        pass: '' // Your 16-character app password
    }
});
// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { email, password, dateOfBirth } = req.body;

    // Validate incoming data (email, password, dateOfBirth)
    if (!email || !password || !dateOfBirth) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Insert user data into the database
        pool.query('INSERT INTO users (email, password_hash, date_of_birth, signup_timestamp) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, dateOfBirth, new Date()],
            (error, results, fields) => {
                if (error) {
                    console.error('Error inserting user:', error);
                    // Check for duplicate entry error
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                res.status(201).json({ message: 'User signed up successfully' });
            }
        );
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Validate incoming data (email, password)
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Retrieve user from database based on email
    pool.query('SELECT user_id, email, password_hash FROM users WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            console.error('Error retrieving user:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password matches hashed password
        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!result) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // If authentication is successful, generate JWT
            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Return JWT and userId to the client
            res.status(200).json({ message: 'Login successful', userId: user.user_id, token: token });
        });
    });
});


// Middleware to verify JWT and extract user_id
function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.userId = decoded.userId; // Use decoded.userId instead of decoded.user_id
        next();
    });
}

// Example of a protected route
app.get('/api/protected-route', verifyToken, (req, res) => {
    // Access userId from req.userId
    const userId = req.userId;

    // Retrieve user data from the database based on userId
    pool.query('SELECT * FROM users WHERE user_id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Error retrieving user data:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // User data found, send it in the response
        const user = results[0];
        res.status(200).json({ message: 'User data retrieved successfully', user: user });
    });
});


// Endpoint for sending OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Generate OTP (you can use a library for this)
        const otp = generateOTP();

        // Save OTP in database for verification
        await saveOTPInDatabase(email, otp);

        // Send OTP via email
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// Helper function to verify OTP
async function verifyOTP(email, otp) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM otps WHERE email = ? AND otp = ?', [email, otp], (error, results, fields) => {
            if (error) {
                console.error('Error verifying OTP in database:', error);
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

// Endpoint for resetting password
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body; // Extract email, otp, and newPassword from request body

    try {
        // Update password in the database
        await updatePasswordInDatabase(email, newPassword);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

// Helper function to update password in the database
async function updatePasswordInDatabase(email, newPassword) {
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password hash in the database
        pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
    } catch (error) {
        console.error('Error updating password in database:', error);
        throw error;
    }
}


// Helper function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to save OTP in database
async function saveOTPInDatabase(email, otp) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO otps (email, otp, created_at) VALUES (?, ?, NOW())', [email, otp], (error, results, fields) => {
            if (error) {
                console.error('Error saving OTP in database:', error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Helper function to send OTP via email
async function sendOTPEmail(email, otp) {
    try {
        await transporter.sendMail({
            from: 'harshamandava695@gmail.com', // Your Gmail email address
            to: email,
            subject: 'OTP for Password Reset',
            text: `Your OTP for password reset is: ${otp}`
        });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}


app.post('/api/update-profile', verifyToken, (req, res) => {
    const { username, email, dateOfBirth } = req.body;
    const userId = req.userId; // Extracted from the JWT token
  
    // Check if any required fields are missing
    if (!username || !email || !dateOfBirth) {
      return res.status(400).json({ message: 'Please provide username, email, and date of birth' });
    }
  
    // Define the SQL query to retrieve the user's email based on userId
    const query = 'SELECT email FROM users WHERE user_id = ?';
  
    // Execute the query
    pool.query(query, [userId], (error, results, fields) => {
      if (error) {
        console.error('Error retrieving user email:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
      }
  
      // If no user found with the provided userId, return an error
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userEmail = results[0].email;
  
      // Check if the provided email matches the user's email
      if (userEmail !== email) {
        return res.status(403).json({ message: 'You are not authorized to update this email' });
      }
  
      // Update profile logic
      const updateQuery = 'UPDATE users SET username = ?, date_of_birth = ? WHERE email = ?';
  
      pool.query(updateQuery, [username, dateOfBirth, email], (error, results, fields) => {
        if (error) {
          console.error('Error updating profile:', error);
          return res.status(500).json({ message: 'Failed to update profile' });
        }
  
        // Check if any rows were affected by the update
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'No changes made to the profile' });
        }
  
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    });
  });

// Endpoint to delete user account
app.post('/api/delete-account', (req, res) => {
    const { email, password } = req.body;

    // Check if the email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required for account deletion' });
    }

    // Check if the user exists and verify the password before attempting deletion
    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            console.error('Error checking user existence:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // If no user found with the provided email, return an error
        if (results.length === 0) {
            console.log('User not found for deletion');
            return res.status(404).json({ message: 'User not found for deletion' });
        }

        // Retrieve the user's hashed password from the database
        const user = results[0];
        const hashedPassword = user.password_hash;

        // Compare the provided password with the hashed password
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!result) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // If password matches, proceed to delete user from the database
            pool.query('DELETE FROM users WHERE email = ?', [email], (error, results, fields) => {
                if (error) {
                    console.error('Error deleting user:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                res.status(200).json({ message: 'User account deleted successfully' });
            });
        });
    });
});


app.post('/api/sign-out', (req, res) => {
    // Logic to invalidate the user's session/token
    // You may implement this based on your authentication mechanism (e.g., JWT, session)
    // For example, clearing the session/token from the client-side or server-side storage
    res.status(200).json({ message: 'Signed out successfully' });
  });



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
