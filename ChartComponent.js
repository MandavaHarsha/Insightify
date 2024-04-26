// ChartComponent.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const ChartComponent = ({ data }) => {
  console.log('Chart Data:', data);

  const [aggregatedData, setAggregatedData] = useState({});

  // Update aggregated data when data changes
  useEffect(() => {
    const updatedAggregatedData = data.reduce((acc, current) => {
      // Convert product name to lowercase and trim leading/trailing spaces
      const productName = current.Product_Name.toLowerCase().trim();
      if (acc[productName]) {
        acc[productName] += current.Quantity;
      } else {
        acc[productName] = current.Quantity;
      }
      return acc;
    }, {});
    setAggregatedData(updatedAggregatedData);
  }, [data]);

  // Extract product names and aggregated quantities
  const productNames = Object.keys(aggregatedData);
  const quantities = Object.values(aggregatedData);

  const chartData = {
    labels: productNames,
    datasets: [
      {
        data: quantities,
      },
    ],
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.header}>Product Sales Chart</Text>
        <BarChart
          data={chartData}
          width={productNames.length * 80}
          height={300} // Adjusted height to accommodate reduced label font size
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0, // No decimal places
            color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`, // Bar color
            labelColor: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`, // Label color
            style: {
              borderRadius: 16,
            },
          }}
          showValuesOnTopOfBars
          fromZero
          yAxisLabel=""
          yAxisInterval={1}
          xLabelsOffset={-10}
          withInnerLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          verticalLabelRotation={30}
          style={{ marginBottom: 20 }} // Added margin at the bottom to create space between chart and other components
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ChartComponent;
