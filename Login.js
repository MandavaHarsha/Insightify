import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode'; // Assuming you're using a library like jwt-decode

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef(null);
  const navigation = useNavigation();

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await authenticateUser();
      setIsLoading(false);
  
      if (response.ok) {
        const responseData = await response.json();
        console.log('Login response:', responseData);
  
        // Check if userId and token exist in the response
        if (responseData.userId !== undefined && responseData.token !== undefined) {
          // Store userId and token in AsyncStorage
          await AsyncStorage.setItem('userId', responseData.userId.toString());
          await AsyncStorage.setItem('token', responseData.token);
  
          // Navigate to the main screen
          navigation.navigate('Main', { userId: responseData.userId });
        } else {
          Alert.alert('Error', 'User ID or token is missing in the response');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };

  const authenticateUser = async () => {
    const { email, password } = formData;

    try {
      setIsLoading(true);

      const response = await fetch('http://10.0.6.49:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      setIsLoading(false);

      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignUp = () => {
    // Navigate to the sign-up screen
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    // Navigate to the forgot password screen
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.additionalButton} onPress={handleSignUp}>
          <Text style={styles.additionalButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.additionalButton} onPress={handleForgotPassword}>
          <Text style={styles.additionalButtonText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  additionalButton: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  additionalButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
