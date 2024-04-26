import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailsPage = ({ route, navigation }) => {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching userId from AsyncStorage:', error);
      }
    };
  
    fetchUserId();
  }, []);

  const productList = route.params.productList || [];

  const calculateTotalPrice = (quantity, price) => {
    return quantity * price;
  };

  const calculateOverallTotalPrice = () => {
    return productList.reduce((total, product) => total + calculateTotalPrice(product.quantity, product.price), 0);
  };

  const handleNext = async () => {
    try {
      const saleIdResponse = await fetch('http://10.0.6.49:3001/api/getNextSaleId');
      const saleIdData = await saleIdResponse.json();
      const saleId = saleIdData.nextSaleId;

      const storedUserId = await AsyncStorage.getItem('userId');

      const mappedProductList = productList.map(product => {
        const { date, productName, quantity, price } = product;
        const totalPrice = calculateTotalPrice(quantity, price);

        if (!date || !productName || !quantity || !price || !totalPrice) {
          throw new Error('Invalid data: Missing required fields');
        }

        return {
          user_id: storedUserId,
          sale_id: saleId,
          date,
          productName,
          quantity,
          price,
          totalPrice,
        };
      });

      const response = await fetch('http://10.0.6.49:3001/api/storeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: storedUserId,
          productList: mappedProductList,
        }),
      });

      if (response.ok) {
        console.log('Data stored successfully');
        Alert.alert('Success', 'Product details stored successfully.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]);
      } else {
        const errorMessage = await response.text();
        console.error('Error storing data in the database:', errorMessage);
        Alert.alert('Error', `Could not store data in the database. ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `An unexpected error occurred. Please try again. ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Details</Text>

      <View style={styles.tableContainer}>
        <Text style={styles.tableHeader}>Product Details</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>Product Name</Text>
            <Text style={styles.tableHeaderCell}>Date</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Total Price</Text>
          </View>
          {productList.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{product.productName}</Text>
              <Text style={styles.tableCell}>{product.date}</Text>
              <Text style={styles.tableCell}>{product.quantity}</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>${product.price}</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>${calculateTotalPrice(product.quantity, product.price)}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.totalPriceLabel]}>Overall Total Price:</Text>
            <Text style={[styles.tableCell, styles.totalPriceAmount]}>${calculateOverallTotalPrice().toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3498db',
  },
  tableContainer: {
    flex: 1,
    marginTop: 20,
  },
  tableHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  priceCell: {
    color: '#4CAF50',
  },
  totalPriceLabel: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalPriceAmount: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
  },
  nextButton: {
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default DetailsPage;
