import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TermsOfService: React.FC = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Terms of Service</Text>
    <Text style={styles.body}>
      Welcome to Ping! By using our service, you agree to the following terms:
      {'\n\n'}
      1. You must use the app in accordance with all applicable laws and regulations.
      {'\n\n'}
      2. You are responsible for maintaining the confidentiality of your account.
      {'\n\n'}
      3. We reserve the right to suspend or terminate accounts for misuse or violation of these terms.
      {'\n\n'}
      4. Your data is handled according to our privacy policy.
      {'\n\n'}
      5. The service is provided as-is, without warranties of any kind.
      {'\n\n'}
      For more information, contact support@getpingapp.com.
    </Text>
  </ScrollView>
);

export default TermsOfService;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#444',
    textAlign: 'left',
    lineHeight: 24,
  },
});
