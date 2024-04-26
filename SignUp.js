import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const SignUp = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [signupClicked, setSignupClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSignUp = async () => {
    setSignupClicked(true);

    // Validate form fields
    if (!formData.username || !formData.email || !formData.password || !formData.dateOfBirth || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check if password matches confirm password
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://10.0.6.49:3000/api/signup', formData);
      
      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.message || 'Signup failed. Please try again later.');
      }
    } catch (error) {
      console.error('Error signing up:', error.response);
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prevState => ({ ...prevState, dateOfBirth: formattedDate }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, !formData.username && signupClicked && styles.errorText]}
          value={formData.username}
          onChangeText={text => handleInputChange('username', text)}
          placeholder="Enter your username"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, (!formData.email || !formData.email.includes('@')) && signupClicked && styles.errorText]}
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, !formData.password && signupClicked && styles.errorText]}
          value={formData.password}
          onChangeText={text => handleInputChange('password', text)}
          placeholder="Enter your password"
          secureTextEntry={true}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={[styles.input, !formData.confirmPassword && signupClicked && styles.errorText]}
          value={formData.confirmPassword}
          onChangeText={text => handleInputChange('confirmPassword', text)}
          placeholder="Confirm your password"
          secureTextEntry={true}
          placeholderTextColor="#888"
        />
      </View>

      <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.label}>Date of Birth</Text>
        <View style={styles.datePickerContainer}>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={text => handleInputChange('dateOfBirth', text)}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            placeholderTextColor="#888"
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="spinner"
          onChange={onDateChange}
          isVisible={showDatePicker}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginText} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginButtonText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
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
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
  },
  loginButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    borderColor: 'red',
  },
});

export default SignUp;
