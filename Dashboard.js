import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Correct import statement for AsyncStorage
import FilterComponent from './FilterComponent';
import ChartComponent from './ChartComponent';
import DataDisplayComponent from './DataDisplayComponent';
import BigNumberComponent from './BigNumberComponent';
import ErrorGifImage from './assets/404.gif';
import NoDataGifImage from './assets/NoDataformonth.gif';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Arial': require('./fonts/arial.ttf'),
  });

  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId != null ? storedUserId : ''); // Handle case when storedUserId is null
      } catch (error) {
        console.error('Error fetching userId:', error);
        // Handle error fetching userId
      }
    };

    fetchUserId();
  }, []); // Fetch userId only once when component mounts

  useEffect(() => {
    fetchData();
  }, [selectedMonth, userId]); // Trigger fetchData whenever selectedMonth or userId changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://10.0.6.49:3001/api/products?month=${selectedMonth}&userId=${userId}`);
      const result = await response.json();
      setData(result);
      setError(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const totalSales = data?.products?.reduce((sum, product) => sum + product.Quantity, 0) || 0;
  const mostSoldProduct = data?.products?.reduce((mostSold, product) => {
    return mostSold.Quantity > product.Quantity ? mostSold : product;
  }, {}) || {};

  return (
    <FlatList
      style={styles.container}
      data={[null]} // Placeholder data
      renderItem={({ index }) => (
        <View key={`item_${index}`}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Dashboard</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Text style={styles.filterButtonText}>Filter By</Text>
            </TouchableOpacity>
          </View>
          {showFilter && (
            <FilterComponent
              selectedMonth={selectedMonth}
              onMonthChange={(month) => setSelectedMonth(month)}
              onClose={() => setShowFilter(false)}
            />
          )}
          {loading ? (
            <CustomLoader />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Image source={ErrorGifImage} style={styles.errorImage} />
              <Text style={styles.errorText}>Oops! Something went wrong</Text>
            </View>
          ) : !data ? (
            <TouchableOpacity style={styles.noDataContainer} onPress={() => setShowFilter(true)}>
              <Image source={NoDataGifImage} style={styles.noDataImage} />
              <Text style={styles.noDataText}>
                Data not available{"\n"}Try adding the data for selected Month
              </Text>
            </TouchableOpacity>
          ) : (
            <>
            <BigNumberComponent
              totalEarnings={data.totalEarnings}
              totalSales={totalSales} // Pass totalSales here
              mostSoldProduct={mostSoldProduct}
              />
              <View style={styles.chartContainer}>
                {data.products && data.products.length > 0 ? (
                  <ChartComponent key={`chart_${index}`} data={data.products} />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Image source={NoDataGifImage} style={styles.noDataImage} />
                    <Text style={styles.noDataText}>Data not available{"\n"}Try adding the data for selected Month</Text>
                  </View>
                )}
              </View>
              <DataDisplayComponent key={`dataDisplay_${index}`} data={data.products} />
            </>
          )}
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}

const CustomLoader = () => {
  return (
    <View style={styles.customLoader}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loaderText}>Please wait a moment</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Updated text color
  },
  filterButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 190,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noDataImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  errorImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  errorText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'Arial',
    fontStyle: 'italic',
  },
  chartContainer: {
    marginBottom: 20,
  },
});
