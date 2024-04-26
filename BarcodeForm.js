import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage


const BarcodeForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    barcodeNumber: '', 
    productName: '',
    price: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const barcodeInputRef = useRef(null);

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
  
      const userId = await AsyncStorage.getItem('userId');
  
      const response = await saveData(userId); // Pass userId to the saveData function
  
      setIsLoading(false);
  
      if (response.ok) {
        Alert.alert('Success', 'Data successfully saved!');
        setFormData({
          barcodeNumber: '',
          productName: '',
          price: '',
        });
      } else {
        const errorMessage = await response.text(); // Get the error message from the response
        console.error('Error saving data:', errorMessage);
        Alert.alert('Error', `Failed to save data. ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };
  
  
  const saveData = async (userId) => {
    try {
      if (!userId || !formData) {
        throw new Error('Missing formData or userId in request body');
      }
  
      // Make the POST request to save barcode data
      const response = await fetch('http://10.0.6.49:3003/saveBarcodeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          userId: userId,
        }),
      });
  
      return response; // Return the response for further handling
    } catch (error) {
      console.error('Error saving data:', error);
      throw error; // Rethrow the error for further handling
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Barcode Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Barcode Number</Text>
        <TextInput
          ref={barcodeInputRef}
          style={styles.input}
          value={formData.barcodeNumber}
          onChangeText={(text) => handleInputChange('barcodeNumber', text)}
          placeholder="Enter barcode number"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={formData.productName}
          onChangeText={(text) => handleInputChange('productName', text)}
          placeholder="Enter product name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => handleInputChange('price', text)}
          keyboardType="numeric"
          placeholder="Enter price"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Save</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onClose} disabled={isLoading}>
        <Text style={styles.buttonText}>Back to Main</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  label: {
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4DC4CB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default BarcodeForm;