const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Configure MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'products',
  port: 3306,
});

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());

// Function to execute a SQL query
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        console.error('Query:', query);
        console.error('Values:', values);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// New function to fetch forecasted data
function fetchForecastedData() {
  const query = 'SELECT * FROM forecasted_data';
  return executeQuery(query);
}

// Endpoint for getting the next available sale_id
app.get('/api/getNextSaleId', async (req, res) => {
  try {
    const result = await executeQuery('SELECT MAX(sale_id) + 1 AS nextSaleId FROM product_inf');
    const nextSaleId = result[0].nextSaleId || 1; // Default to 1 if no sale_id exists yet
    res.status(200).json({ nextSaleId });
  } catch (error) {
    console.error('Error fetching the next sale_id:', error);
    res.status(500).send(`Error fetching the next sale_id: ${error.message}`);
  }
});

app.post('/api/storeData', async (req, res) => {
  const { userId, productList } = req.body; // Extract userId and productList from request body

  try {
    // Generate the nextSaleId only once for all products
    const nextSaleIdResult = await executeQuery('SELECT MAX(sale_id) + 1 AS nextSaleId FROM product_inf');
    const nextSaleId = nextSaleIdResult[0].nextSaleId || 1; // Default to 1 if no sale_id exists yet

    console.log('Next Sale ID:', nextSaleId); // Log nextSaleId for debugging

    const insertQuery = `INSERT INTO product_inf (user_id, sale_id, Date, Product_Name, Quantity, Price, Total_Price) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await Promise.all(productList.map(async product => {
      const { date, productName, quantity, price, totalPrice } = product;

      // Validate that required fields are present
      if (!date || !productName || !quantity || !price || !totalPrice) {
        throw new Error('Invalid data: Missing required fields');
      }

      try {
        // Execute the SQL query with the shared nextSaleId and userId
        await executeQuery(insertQuery, [userId, nextSaleId, date, productName, quantity, price, totalPrice]);
      } catch (insertError) {
        console.error('Error inserting product:', insertError);
        console.error('Product:', product);
        throw insertError; // Propagate the error
      }
    }));

    res.status(200).send('Data stored successfully');
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send(`Error storing data in the database: ${error.message}`);
  }
});

// Endpoint for fetching products with additional data
app.get('/api/products', async (req, res) => {
  const { month, userId } = req.query; // Make sure to use 'userId' instead of 'Userid'

  let query = 'SELECT * FROM product_inf WHERE user_id = ?'; // Use 'user_id' here
  const queryValues = [userId];

  if (month) {
    // If a month is specified, filter by that month as well
    query += ' AND MONTH(Date) = ?';
    queryValues.push(month);
  }

  try {
    const products = await executeQuery(query, queryValues);

    // Fetch forecasted data
    const forecastedData = await fetchForecastedData();

    // Calculate total earnings
    const totalEarnings = products.reduce((sum, product) => sum + product.Total_Price, 0);

    // Find product with highest sale
    const productWithHighestSale = products.reduce((maxProduct, product) => {
      return product.Total_Price > maxProduct.Total_Price ? product : maxProduct;
    }, products[0]);

    res.status(200).json({
      products,
      forecastedData,
      totalEarnings,
      productWithHighestSale,
    });
  } catch (error) {
    console.error('Error fetching products from the database:', error);
    res.status(500).send(`Error fetching products from the database: ${error.message}`);
  }
});

// Define an API endpoint to fetch forecast data for a particular user
app.get('/api/forecast', async (req, res) => {
  const { userId } = req.query;

  try {
    // Query to fetch forecast data for a specific user from the product_inf table
    const query = 'SELECT Product_Name, Date, Quantity FROM product_inf WHERE user_id = ?';

    // Execute the query to fetch forecast data for the specified user
    const forecastData = await executeQuery(query, [userId]);

    // Respond with the fetched forecast data
    res.status(200).json(forecastData);
  } catch (error) {
    // Handle errors
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Close the database connection when the server shuts down
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('MySQL connection pool closed');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});