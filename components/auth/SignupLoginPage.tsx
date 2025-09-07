import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ImageBackground,
} from 'react-native';
import auth from '@react-native-firebase/auth';

//  TODO refacotr this to use phone capcha and to look like web

const SignupLoginPageNative = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isEmailLogin, setIsEmailLogin] = useState(true); // Toggle between email and phone login

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('User signed in');
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const handlePhoneSignin = async () => {
    try {
      if (!confirmationResult) {
        const confirmation = await auth().signInWithPhoneNumber(phone);
        setConfirmationResult(confirmation);
        Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
      } else {
        await confirmationResult.confirm(otp);
        console.log('User signed in');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://source.unsplash.com/random/800x600' }} // Add a background image URL
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign In</Text>
          <View style={styles.switchContainer}>
            <TouchableOpacity onPress={() => setIsEmailLogin(true)}>
              <Text
                style={
                  isEmailLogin ? styles.activeSwitchText : styles.switchText
                }
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEmailLogin(false)}>
              <Text
                style={
                  !isEmailLogin ? styles.activeSwitchText : styles.switchText
                }
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>
          {isEmailLogin ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity style={styles.button} onPress={() => {}}>
                <Text style={styles.buttonText}>Send Sign-In Link</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {confirmationResult && (
                <TextInput
                  style={styles.input}
                  placeholder="OTP"
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={setOtp}
                />
              )}
              <TouchableOpacity
                style={styles.button}
                onPress={handlePhoneSignin}
              >
                <Text style={styles.buttonText}>
                  {confirmationResult ? 'Verify OTP' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for better readability
    width: '100%',
    height: '100%',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    height: '70%',
    maxHeight: 600,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
  },
  activeSwitchText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3498db',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupLoginPageNative;
