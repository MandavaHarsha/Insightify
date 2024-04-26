import React, { useState, useEffect, useRef} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, DrawerLayoutAndroid } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import BarcodeForm from './BarcodeForm';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const HomePage = () => {
  const drawerRef = useRef(null);
  const navigation = useNavigation();
  const routeState = useNavigationState((state) => state);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
  });

  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [productList, setProductList] = useState([]);
  const cameraRef = useRef(null);
  const [showBarcodeForm, setShowBarcodeForm] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  }, []);

  useEffect(() => {
    console.log("Home page focused"); // Add this line
    const unsubscribe = navigation.addListener('focus', () => {
      const { refresh } = routeState?.routes[routeState?.index]?.params || {};
  
      if (refresh) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    });
  
    return unsubscribe;
  }, [navigation, routeState]);
  

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleScanBarcode = () => {
    setShowScanner(true);
  };

  const handleBarCodeScanned = async ({ data }) => {
    try {
      // Fetch the userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await axios.post('http://10.0.6.49:3003/parseBarcodeData', { 
        barcode: data,
        userId: userId // Pass the userId to the backend
      });
      const barcodeData = response.data;
  
      console.log('Barcode data:', barcodeData);
  
      if (barcodeData.error === 'Barcode data not found') {
        Alert.alert('Barcode Scanned', 'Product details not found');
      } else {
        setFormData(prevState => ({
          ...prevState,
          productName: barcodeData.Product_Name || '',
          price: barcodeData.Price || '',
        }));
  
        // Log the updated formData
        console.log('Updated formData:', formData);
  
        setShowScanner(false);
        Alert.alert('Barcode Scanned', 'Product details fetched from barcode.');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      Alert.alert('Error', 'Failed to fetch product details from barcode.');
    }
  };
  
  const handleSave = () => {
    if (!formData.productName || !formData.quantity || !formData.price) {
      Alert.alert('Validation Error', 'Please fill in all fields before saving.');
      return;
    }

    setProductList([...productList, formData]);
    setFormData(prevState => ({
      ...prevState,
      barcode: '', // Assuming barcode is not required for saving
      date: new Date().toISOString().split('T')[0], // Reset date to today's date
      productName: '', // Reset productName after saving
      quantity: '', // Reset quantity after saving
      price: '', // Reset price after saving
    }));
};
  const handleViewDetails = async () => {
    try {
      // Fetch the user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      
      // Navigate to the Details page with user ID and productList as route parameters
      navigation.navigate('Details', { userId: userId, productList: productList });
    } catch (error) {
      console.error('Error fetching user ID:', error);
      Alert.alert('Error', 'Failed to fetch user ID.');
    }
  };

  const handleBack = () => {
    setShowScanner(false);
  };

  const handleNavigation = (option) => {
    if (drawerRef.current) {
      drawerRef.current.closeDrawer();
    }
  
    if (option === 'Account') {
      navigation.navigate('Account');
    } else if (option === 'Barcode Data') {
      setShowBarcodeForm(true);
    }
  };

  const handleCloseBarcodeForm = () => {
    setShowBarcodeForm(false);
    if (drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  };

  const navigationView = (
    <View style={styles.sideNav}>
      <TouchableOpacity style={styles.sideNavOption} onPress={() => handleNavigation('Account')}>
        <Text>Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sideNavOption} onPress={() => handleNavigation('Barcode Data')}>
        <Text>Barcode Data</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <DrawerLayoutAndroid
      drawerWidth={250}
      drawerPosition={'left'}
      renderNavigationView={() => navigationView}
      ref={drawerRef}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {showScanner ? (
          <View style={styles.barcodeScannerContainer}>
            <Camera
              ref={cameraRef}
              onBarCodeScanned={handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.sideNavButton}
                onPress={() => drawerRef.current.openDrawer()}
              >
                <Image source={require('./assets/menu.png')} style={styles.sideNavIcon} />
              </TouchableOpacity>
              <Text style={styles.header}>Product Info</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={formData.productName}
                onChangeText={(text) => handleInputChange('productName', text)}
                placeholder="Enter product name"
              />

              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity.toString()} // Convert to string
                onChangeText={(text) => handleInputChange('quantity', text)}
                keyboardType="numeric"
                placeholder="Enter quantity"
              />

              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => handleInputChange('date', text)}
                placeholder="Select date"
                editable={false}
              />

              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={formData.price.toString()} // Convert to string
                onChangeText={(text) => handleInputChange('price', text)}
                keyboardType="numeric"
                placeholder="Enter price"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.scanButton, { marginRight: 10 }]} onPress={handleScanBarcode}>
                <Text style={styles.scanButtonText}>Scan Barcode</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, { marginLeft: 10 }]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableContainer}>
              <Text style={styles.tableHeader}>Product Details</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>Date</Text>
                  <Text style={styles.tableHeaderCell}>Product Name</Text>
                  <Text style={styles.tableHeaderCell}>Quantity</Text>
                  <Text style={styles.tableHeaderCell}>Price</Text>
                </View>
                {productList.map((product, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{product.date}</Text>
                    <Text style={styles.tableCell}>{product.productName}</Text>
                    <Text style={styles.tableCell}>{product.quantity}</Text>
                    <Text style={styles.tableCell}>{product.price}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.viewDetailsButton} onPress={handleViewDetails}>
              <Text style={styles.viewDetailsButtonText}>View in Detail</Text>
            </TouchableOpacity>

            {/* Render the BarcodeForm component as a popup */}
            {showBarcodeForm && (
              <>
                <View style={styles.backgroundOverlay} />
                <View style={styles.barcodeFormContainer}>
                  <BarcodeForm onSave={handleSave} onClose={handleCloseBarcodeForm} />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sideNavButton: {
    position: 'absolute',
    left: -3,
  },
  sideNavIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3498db',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
  },
  scanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  tableContainer: {
    marginTop: 20,
  },
  tableHeader: {
    fontSize: 22,
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
    fontSize: 16,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  barcodeScannerContainer: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  sideNav: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  sideNavOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  barcodeFormContainer: {
    position: 'absolute',
    top: '10%',
    left: '10%', 
    width: '90%',
    height:'80%',
    padding: 30,
    backgroundColor: '#fff', 
    borderRadius: 20, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(224, 224, 224, 0.7)',
  },
});

export default HomePage;
