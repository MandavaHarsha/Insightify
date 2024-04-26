import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Forecast = () => {
  const navigation = useNavigation();
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingData, setFetchingData] = useState(false); // New state to track fetch status
  const [fontsLoaded] = useFonts({
    'Arial': require('./fonts/arial.ttf'),
  });

  const fetchForecastData = () => {
    setLoading(true);
    setFetchingData(true); // Set fetchingData to true when fetching data

  
    AsyncStorage.getItem('userId')
      .then((storedUserId) => {
        console.log('Stored User ID:', storedUserId);
        if (!storedUserId) {
          throw new Error('User ID not found');
        }
  
        return fetch(`http://10.0.6.49:5000/forecast/${storedUserId}`)
          .then((response) => {
            console.log('Response:', response);
            if (!response.ok) {
              throw new Error('Error fetching forecast data. Please try again.');
            }
            return response.json();
          })
          .then((data) => {
            console.log('Data:', data);
            const formattedData = Object.entries(data.products).map(([productName, quantity]) => ({
              product: productName,
              totalQuantity: quantity,
            }));
            setForecastData(formattedData);
            setError(null);
          })
          .catch((error) => {
            console.error('Error fetching forecast data:', error); // Log the error
            setError('Error fetching forecast data. Please try again.');
          })
          .finally(() => {
            setLoading(false);
            setRefreshing(false);
          });
      })
      .catch((error) => {
        console.error('Error retrieving stored user ID:', error); // Log the error
        setError('Error retrieving stored user ID.');
        setLoading(false);
        setRefreshing(false);
      });
  };
  

  const handleRefresh = () => {
    setRefreshing(true);
    fetchForecastData();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    navigation.addListener('focus', () => {
      setForecastData([]);
      setError(null);
      setFetchingData(false); // Reset fetchingData when the screen is focused
    });

    return () => {
      navigation.removeListener('focus');
    };
  }, [navigation]);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {forecastData.length > 0 && (
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image source={require('./assets/leftarrow.png')} style={styles.backButtonImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.heading}>Demand Forecast</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loaderText}>Please wait while we fetch the forecast for you</Text>
        </View>
      ) : (
        <>
          {!fetchingData && (
            <View style={styles.emptyListContainer}>
              <View style={styles.noteContainer}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteHeading}>Note</Text>
                  <Image source={require('./assets/i.gif')} style={styles.noteImage} />
                </View>
                <Text style={styles.noteText}>
                  <Text style={styles.highlightedText}>•</Text> Forecasts provided are for the upcoming month.{"\n"}
                </Text>
                <Text style={styles.noteText}>
                  <Text style={styles.highlightedText}>•</Text> Aim for at least 8-12 months of data for accurate forecasts.{"\n"}
                </Text>
                <Text style={styles.noteText}>
                  <Text style={styles.highlightedText}>•</Text> Reliable forecasts stem from clean and consistent data.{"\n"}
                </Text>
                <Text style={styles.noteText}>
                  <Text style={styles.highlightedText}>•</Text> Keep an eye on market shifts for more precise predictions.{"\n"}
                </Text>
                <Text style={styles.noteText}>
                  <Text style={styles.highlightedText}>•</Text> Adapt forecasts to changing business landscapes.
                </Text>
              </View>
            </View>
          )}

          <FlatList
            style={styles.flatListContainer}
            data={forecastData}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({ item }) => (
              <View style={styles.forecastItem}>
                <Text style={styles.productText}>{item.product}</Text>
                <Text style={styles.quantityText}>{item.totalQuantity}</Text>
              </View>
            )}
            ListEmptyComponent={
              !error && (
                <View style={styles.noDataContainer}>
                  {fetchingData && (
                    <>
                      <Image source={require('./assets/datacooking.webp')} style={styles.noDataImage} />
                      <Text style={styles.noDataText}>No forecast yet.</Text>
                      <Text style={styles.noDataText}>Start adding the data to generate forecast.</Text>
                      <Text style={styles.noDataText}>Better the data, better the forecast!</Text>
                    </>
                  )}
                  {!fetchingData && <Button title="Fetch Forecast" onPress={fetchForecastData} color="#3498db" style={styles.fetchButton} />}
                </View>
              )
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListFooterComponent={
              error && (
                <View style={styles.errorContainer}>
                  <Image source={require('./assets/404.gif')} style={styles.errorImage} />
                  <Text style={styles.errorText}>Error Fetching the data</Text>
                </View>
              )
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginLeft: -7,
    },
    backButton: {
      marginRight: 10,
    },
    backButtonImage: {
      width: 30,
      height: 30,
      tintColor: '#333',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderText: {
      marginTop: 20,
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    },
    forecastItem: {
      width: '100%',
      marginBottom: 20,
      backgroundColor: '#FFF',
      borderRadius: 10,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    productText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    quantityText: {
      fontSize: 16,
      color: '#777',
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
    noteContainer: {
      backgroundColor: '#fffdd0',
      marginTop:19,
      borderWidth: 1,
      borderColor: '#D3D3D3',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    noteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    noteHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginRight: 5,
    },
    noteText: {
      fontSize: 16,
      color: '#555',
      marginBottom: 4,
    },
    highlightedText: {
      fontSize: 16,
      color: '#002387',
      fontWeight: 'bold',
    },
    noteImage: {
      width: 25,
      height: 25,
    },
    flatListContainer: {
      flexGrow: 1,
    },
    emptyListContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fetchButton: {
      marginTop: 16,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    noDataImage: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 40,
    },
    noDataText: {
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      fontFamily: 'Arial',
    },
  });
  
export default Forecast;
