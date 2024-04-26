from flask import Flask, jsonify
import mysql.connector
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

app = Flask(__name__)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'products',
    'port': 3306
}

# Connect to the database
db_connection = mysql.connector.connect(**db_config)
db_cursor = db_connection.cursor()

# Endpoint to retrieve forecasted data for one month for a specific user
@app.route('/forecast/<int:user_id>')
def forecast(user_id):
    try:
        # Retrieve product data from the database for the specified user
        query_user_data = "SELECT Date, Product_Name, Quantity FROM product_inf WHERE user_id = %s"
        db_cursor.execute(query_user_data, (user_id,))
        data = db_cursor.fetchall()
        print(f"Retrieved data from the database for user {user_id}:", data)  # Debug print statement

        # Create a pandas DataFrame from the retrieved data
        df = pd.DataFrame(data, columns=['Date', 'Product_Name', 'Quantity'])
        df['Date'] = pd.to_datetime(df['Date'])
        df['Product_Name'] = df['Product_Name'].str.strip().str.lower()  # Remove leading/trailing spaces and convert to lowercase

        # Aggregate data by summing quantities for each product and date
        df = df.groupby(['Product_Name', 'Date'])['Quantity'].sum().reset_index()

        print("Processed DataFrame:", df)  # Debug print statement

        # Initialize an empty dictionary to store forecast data for each product
        forecast_data = {}

        # Group data by product name
        grouped_data = df.groupby('Product_Name')

        # Forecast for each product
        for product_name, group in grouped_data:
            try:
                # Check if there's enough data for forecasting
                if len(group) >= 2:
                    # Create a time series for the current product
                    ts = group.set_index('Date')['Quantity']
                    ts = ts.asfreq('D')  # Specify the frequency as daily ('D')

                    # Perform forecast using ARIMA model
                    arima_model = ARIMA(ts, order=(1, 1, 1))
                    arima_model_fit = arima_model.fit()
                    arima_forecast = arima_model_fit.forecast(steps=1)
                    arima_forecast_value = arima_forecast.values[0]  # Access the scalar forecast value

                    # Perform forecast using SARIMAX model
                    sarima_model = SARIMAX(ts, order=(1, 0, 1), seasonal_order=(1, 1, 1, 12))
                    sarima_model_fit = sarima_model.fit()
                    sarima_forecast = sarima_model_fit.forecast(steps=1)
                    sarima_forecast_value = sarima_forecast.values[0]  # Access the scalar forecast value

                    # Combine the forecasts from ARIMA and SARIMAX models
                    hybrid_forecast = (0.7 * arima_forecast_value) + (0.3 * sarima_forecast_value)

                    # Sum up the forecasted quantities for the entire month
                    total_quantity = hybrid_forecast

                    # Add the total quantity to the forecast_data dictionary
                    forecast_data[product_name] = total_quantity
                else:
                    forecast_data[product_name] = "Insufficient data for forecasting"
            except Exception as e:
                # Handle any errors that occur during the forecast process
                forecast_data[product_name] = str(e)

        # Return the forecasted data as JSON
        return jsonify({'products': forecast_data})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)