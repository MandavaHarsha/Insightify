import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; 

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetFields, setShowResetFields] = useState(false);
  const navigation = useNavigation();

  const handleInputChange = (text) => {
    setEmail(text);
  };

  const handleOtpChange = (text) => {
    setOtp(text);
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await sendOtpEmail(email);
      setIsLoading(false);

      if (response.ok) {
        setShowResetFields(true);
        Alert.alert('Success', 'OTP sent successfully.');
      } else {
        const errorData = await response.text();
        Alert.alert('Error', errorData || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        setIsLoading(false);
        return;
      }

      const response = await resetPassword(email, otp, newPassword);
      setIsLoading(false);

      if (response.ok) {
        Alert.alert('Success', 'Password reset successfully.');
      } else {
        const errorData = await response.text();
        Alert.alert('Error', errorData || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };

  const sendOtpEmail = async (email) => {
    try {
      setIsLoading(true);

      const response = await fetch('http://10.0.6.49:3000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setIsLoading(false);

      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      setIsLoading(true);
  
      const response = await fetch('http://10.0.6.49:3000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });
  
      setIsLoading(false);
  
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Forgot Password</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleInputChange}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Send OTP</Text>
            </>
          )}
        </TouchableOpacity>

        {showResetFields && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={handleOtpChange}
                placeholder="Enter OTP"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="key-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Reset Password</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.additionalButton} onPress={handleGoBack}>
          <Text style={styles.additionalButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
      <Image source={require('./assets/forgotenpassword.png')} style={styles.passwordImage} />
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
  passwordImage: {
    width: 150,
    height: 150,
    marginLeft:270,
    resizeMode: 'contain',
  },
});

export default ForgotPasswordScreen;
