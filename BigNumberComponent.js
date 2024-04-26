// BigNumbersComponent.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BigNumbersComponent = ({ totalEarnings, totalSales, mostSoldProduct }) => {
  return (
    <View style={styles.container}>
      {/* Most Sold Product */}
      <View style={[styles.card, styles.mostSoldProductCard]}>
        <Text style={styles.label}>Mostly Sold</Text>
        <Text style={styles.value}>{mostSoldProduct ? mostSoldProduct.Product_Name : 'No data available'}</Text>
      </View>

      {/* Total Sales */}
      <View style={[styles.card, styles.totalSalesCard]}>
        <Text style={styles.label}>Total Sales</Text>
        <Text style={styles.value}>{totalSales}</Text>
      </View>

      {/* Total Earnings */}
      <View style={[styles.card, styles.totalEarningsCard]}> 
        <Text style={styles.label}>Total Earnings</Text>
        <Text style={styles.value}>${totalEarnings.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop:9,
    paddingHorizontal: 10, // Adjusted padding
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mostSoldProductCard: {
    backgroundColor: '#f39c12',
    marginRight: 5,
  },
  totalEarningsCard: {
    backgroundColor: '#27ae60',
    marginHorizontal: 5,
  },
  totalSalesCard: {
    backgroundColor: '#3498db',
    marginLeft: 5,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  value: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BigNumbersComponent;
