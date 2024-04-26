import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Homescreen';
import DashboardScreen from './Dashboard';
import ForecastScreen from './forecast';
import DetailsPage from './DetailsPage';
import LoginScreen from './Login'; 
import SignUpScreen from './SignUp';
import Account from './Account';
import ForgotPasswordScreen from './forgotpassword'; // Import the ForgotPassword screen
import { Image } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Details" component={DetailsPage} />
    <Stack.Screen name="Account" component={Account} />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        display: 'flex',
      },
      headerShown: true, // Ensure headers are shown
      headerTitle: 'Insightify', // Set the common header title
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('./assets/home.png')}
            style={{ width: 23, height: 23, tintColor: color }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('./assets/dashboard.png')}
            style={{ width: 27, height: 27, tintColor: color }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Forecast"
      component={ForecastScreen}
      options={{
        tabBarLabel: 'Forecast',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('./assets/Forecast.png')}
            style={{ width: 20, height: 20, tintColor: color }}
          />
        ),
      }}
    />
  </Tab.Navigator>
);



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;