import React, { useState,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add showDeleteModal state
  

  const handleUpdateProfile = async () => {
    try {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        'http://10.0.6.49:3000/api/update-profile',
        {
          username,
          email,
          dateOfBirth,
        },
        {
          headers: {
            'Authorization': token, // Include the token in the request headers
          },
        }
      );
  
        if (!response.data || !response.data.message) {
          throw new Error('Failed to update profile');
        }
  
        if (response.status === 200) {
          Alert.alert('Success', response.data.message);
          // Optionally, you can perform additional actions after a successful update
        } else {
          throw new Error('Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        if (error.response && error.response.data && error.response.data.message) {
          Alert.alert('Error', error.response.data.message);
        } else if (!error.response) {
          Alert.alert('Error', 'Failed to update profile. Please try again later.');
        }
      }
    };
  const handleDeleteConfirmation = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setShowDeleteModal(true) },
      ]
    );
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const promptDeleteCredentials = () => {
    Alert.prompt('Enter Email and Password', 'Please enter your email and password to confirm deletion.', (text) => {
      const [enteredEmail, enteredPassword] = text.split(',');
      if (!enteredEmail || !enteredPassword) {
        Alert.alert('Error', 'Please enter both email and password.');
        return;
      }
      handleDeleteAccount(enteredEmail.trim(), enteredPassword.trim());
    });
  };

  const handleDeleteAccount = async (enteredEmail, enteredPassword) => {
    try {
      const response = await axios.post('http://10.0.6.49:3000/api/delete-account', { email: enteredEmail, password: enteredPassword });

      if (response.status === 200) {
        Alert.alert('Success', 'Your account has been deleted.');
        navigation.navigate('Login');
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again later.');
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post('http://10.0.6.49:3000/api/sign-out');
      // Assuming navigation prop is available
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={require('./assets/profile.jpg')} style={styles.profilePicture} />
        <Text style={styles.username}>{username}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { refresh: true })}>
        <FontAwesome5 name="arrow-left" size={20} color="#333" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          autoCapitalize="none"
          placeholderTextColor={'#333'} // Changed placeholder text color
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={'#333'} // Changed placeholder text color
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
          placeholderTextColor={'#333'} // Changed placeholder text color
        />
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 10, marginBottom: 10, backgroundColor: '#2E8B57' }]} onPress={handleUpdateProfile}>
      <View style={styles.buttonContent}>
      <FontAwesome5 name="user-edit" size={20} color="white" />
      <Text style={styles.buttonText}>Update Profile</Text>
      </View>
      </TouchableOpacity>


     <TouchableOpacity style={[styles.button, styles.deleteButton, { backgroundColor: '#dc143c' }]} onPress={handleDeleteConfirmation}>
    <View style={styles.buttonContent}>
    <FontAwesome5 name="trash-alt" size={20} color="white" />
    <Text style={styles.buttonText}>Delete Account</Text>
    </View>
    </TouchableOpacity>


  <TouchableOpacity style={[styles.button, { backgroundColor: '#FF5733' }]} onPress={handleSignOut}>
  <View style={styles.buttonContent}>
  <FontAwesome5 name="sign-out-alt" size={20} color="white" />
  <Text style={styles.buttonText}>Sign Out</Text>
  </View>
  </TouchableOpacity>


      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={'#2196F3'}
              />
            </View>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                placeholderTextColor={'#2196F3'}
              />
            </View>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={promptDeleteCredentials}>
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={closeDeleteModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2196F3', // Changed border color to primary color
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 10, // Adjust the margin bottom as needed
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical:8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20, // Reduced padding vertical
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15, // Reduced margin bottom
    textAlign: 'center',
    color: '#333',
  },
  modalInputContainer: {
    marginBottom: 10, // Reduced margin bottom
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 5, // Reduced margin bottom
    width: '100%',
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15, // Reduced margin top
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AccountPage;
