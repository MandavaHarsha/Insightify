const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '', // Update with your database password
  port: 3306,
  database: 'barcodedata',
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1); // Exit the process if unable to connect
  }
  console.log('Connected to MySQL database');
  connection.release(); // Release the connection
});

const parseBarcodeData = (barcode, userId, callback) => {
  const sql = 'SELECT * FROM barcodes WHERE Barcode_number = ? AND UserId = ?';
  const values = [barcode, userId];

  console.log('SQL Query:', sql, 'Values:', values);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return callback(err, null);
    }

    connection.query(sql, values, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error retrieving barcode data:', error);
        return callback(error, null);
      }

      if (results.length === 0) {
        return callback(null, { error: 'Barcode data not found' });
      } else {
        return callback(null, results[0]);
      }
    });
  });
};

app.post('/parseBarcodeData', (req, res) => {
  const { barcode, userId } = req.body;

  parseBarcodeData(barcode, userId, (error, productDetails) => {
    if (error) {
      console.error('Error parsing barcode data:', error);
      return res.status(500).json({ error: 'Error parsing barcode data' });
    } else {
      res.json(productDetails);
    }
  });
});

const saveBarcodeData = (formData, userId, callback) => {
  const { barcodeNumber, productName, price } = formData;

  if (!barcodeNumber || !productName || !price || !userId) {
    return callback(new Error('Missing required data'), null);
  }

  const sql = 'INSERT INTO barcodes (Barcode_number, Product_Name, Price, UserId) VALUES (?, ?, ?, ?)';
  const values = [barcodeNumber, productName, price, userId];

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return callback(err, null);
    }

    connection.query(sql, values, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error saving barcode data:', error);
        return callback(error, null);
      }

      console.log('Barcode data saved successfully.');
      return callback(null, results);
    });
  });
};

app.post('/saveBarcodeData', (req, res) => {
  const { formData, userId } = req.body;

  saveBarcodeData(formData, userId, (error, result) => {
    if (error) {
      console.error('Error saving barcode data:', error);
      return res.status(500).json({ error: 'Failed to save data. Please try again later.' });
    }

    if (result && result.affectedRows > 0) {
      return res.json({ message: 'Barcode data saved successfully' });
    } else {
      console.error('No rows affected during barcode data save:', result);
      return res.status(500).json({ error: 'Failed to save data. No rows affected.' });
    }
  });
});

app.get('/getBarcodeData', (req, res) => {
  const { barcode, userId } = req.query;

  if (!barcode || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const sql = 'SELECT * FROM barcodes WHERE Barcode_number = ? AND UserId = ?';
  const values = [barcode, userId];

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    connection.query(sql, values, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error retrieving barcode data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No data found for the given barcode and user ID' });
      }

      const productDetails = results[0];
      res.json(productDetails);
    });
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
