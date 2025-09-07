import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../app/store/reducers/authSlice';
import { auth } from '../firebase/firebaseCommon';

declare global {
  interface Window {
    recaptchaVerifier?: any;
    recaptchaWidgetId?: any;
  }
}

const SignupLoginPageWeb: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notice, setNotice] = useState<string>('');
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);

  const currentUser = useSelector(selectCurrentUser);
  const router = useRouter();



  useEffect(() => {
    // Always use the imported 'auth' instance from firebaseConfig.web
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, // authExtern: the web Auth instance
          'recaptcha-container', // containerOrId: must be in the DOM
          {
            size: 'invisible',
            callback: (response: any) => {
              console.log('Recaptcha resolved', response);
            },
          }
        );
        window.recaptchaVerifier.render().then((widgetId: any) => {
          window.recaptchaWidgetId = widgetId;
          console.log('Recaptcha rendered, widgetId:', widgetId);
        });
      } catch (err) {
        console.error('Error initializing RecaptchaVerifier:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.back();
    }
  }, [currentUser]);

  const validateEmailField = (emailLocal: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLocal || !emailRegex.test(emailLocal)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const validatePhoneField = (phoneLocal: string): string | null => {
    const phoneNumber = parsePhoneNumberFromString(phoneLocal, 'US');
    if (!phoneNumber || !phoneNumber.isValid()) {
      return 'Please enter a valid phone number.';
    }
    return null;
  };

  const validateVerificationCodeField = (code: string): string | null => {
    if (!code.trim()) {
      return 'Verification code is required.';
    }
    return null;
  };

  const handleError = (error: any) => {
    const errorMessage =
      typeof error === 'string'
        ? error
        : error.message || 'An unknown error occurred';
    console.error(error);
    setErrors({ general: errorMessage });
  };

  const handlePhoneSignin = async () => {
    setErrors({});
    const phoneError = validatePhoneField(phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }
    try {
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = parsePhoneNumberFromString(phone, 'US')?.number;
      if (!phoneNumber) {
        setErrors({ phone: 'Invalid phone number.' });
        return;
      }
      // Log to confirm correct auth and verifier
      console.log('Using auth instance:', auth);
      console.log('Using appVerifier:', appVerifier);
      const result = await signInWithPhoneNumber(
        auth, // always use imported auth
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(result);
      setErrors({});
      setIsCodeSent(true);
    } catch (error) {
      handleError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    // Clear previous errors
    setErrors({});

    // Validate verification code
    const codeError = validateVerificationCodeField(verificationCode);
    if (codeError) {
      setErrors({ verificationCode: codeError });
      return;
    }

    if (!confirmationResult) {
      handleError('Verification not started. Please resend the code.');
      return;
    }

    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      console.log('User signed in:', userCredential.user.phoneNumber);
      // Removed backend user creation from here
      router.replace("/(tabs)/index");
    } catch (error) {
      handleError('Invalid verification code. Please try again.');
    }
  };

  const handleEmailLinkSignIn = async () => {
    setErrors({});
    setNotice('');
    const emailError = validateEmailField(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    try {
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const actionCodeSettings = {
        url: isDev
          ? 'http://localhost:8081/auth/email-link'
          : 'https://www.gettpingapp.com/auth/email-link',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setNotice('A sign-in link has been sent to your email. Please check your inbox. If you do not see it, check your spam or junk folder.');
    } catch (error) {
      handleError(error);
    }
  };

  // Check if the form is valid
  const isPhoneFormValid = () => {
    return !validatePhoneField(phone);
  };

  const isEmailFormValid = () => {
    return !validateEmailField(email);
  };

  const isVerificationCodeValid = () => {
    return !validateVerificationCodeField(verificationCode);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://source.unsplash.com/random/800x600' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign In</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
              onPress={() => setActiveTab('phone')}
            >
              <Text style={styles.tabText}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
              onPress={() => setActiveTab('email')}
            >
              <Text style={styles.tabText}>Email</Text>
            </TouchableOpacity>
          </View>
          {notice && (
            <Text style={styles.noticeText}>{notice}</Text>
          )}
          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}
          {activeTab === 'phone' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!confirmationResult}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              {isCodeSent && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Verification Code"
                    keyboardType="numeric"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                  />
                  {errors.verificationCode && (
                    <Text style={styles.errorText}>
                      {errors.verificationCode}
                    </Text>
                  )}
                </>
              )}
              <TouchableOpacity
                style={[
                  styles.button,
                  !isCodeSent && !isPhoneFormValid() && styles.buttonDisabled,
                  isCodeSent &&
                  !isVerificationCodeValid() &&
                  styles.buttonDisabled,
                ]}
                onPress={isCodeSent ? handleVerifyCode : handlePhoneSignin}
                disabled={
                  (!isCodeSent && !isPhoneFormValid()) ||
                  (isCodeSent && !isVerificationCodeValid())
                }
              >
                <Text style={styles.buttonText}>
                  {isCodeSent ? 'Verify Code' : 'Send Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              <TouchableOpacity
                style={[styles.button, !isEmailFormValid() && styles.buttonDisabled]}
                onPress={handleEmailLinkSignIn}
                disabled={!isEmailFormValid()}
              >
                <Text style={styles.buttonText}>Sign In with Email Link</Text>
              </TouchableOpacity>
            </>
          )}
          <Text style={styles.termsText}>
            By using this service, you agree to our{' '}
            <Link href="/(tabs)/index/terms-of-service" style={styles.linkText}>
              Terms of Service
            </Link>
            .
          </Text>
          <div id="recaptcha-container"></div>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignupLoginPageWeb;

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 10,
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#3498db',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  noticeText: {
    color: '#3498db',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  switchButton: {
    marginTop: 10,
  },
  switchButtonText: {
    color: '#3498db',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
});
