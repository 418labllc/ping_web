import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';

export default function ActiveCall() {
  const [helpCode, setHelpCode] = useState('');

  const handleRequestHelp = () => {
    if (!helpCode.trim()) {
      Alert.alert('Missing Code', 'Please enter a help code.');
      return;
    }
    Alert.alert('Help Requested', `Help code ${helpCode} submitted. A staff member will be with you shortly!`);
    setHelpCode('');
  };

  const handleChange = (text: string) => {
    setHelpCode(text.toUpperCase());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Call</Text>
      <Text style={styles.body}>
        Enter your help code below and tap the button to request help. A staff member will be notified and come to assist you as soon as possible. You can also chat with staff before they respond to your call.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER HELP CODE"
        placeholderTextColor="#aaa"
        value={helpCode}
        onChangeText={handleChange}
        autoCapitalize="characters"
      />
      <TouchableOpacity style={styles.button} onPress={handleRequestHelp}>
        <Text style={styles.buttonText}>Request Help</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        This is a demo screen. In the real app, your request would be sent to the team instantly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    marginBottom: 24,
    color: '#ccc',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#444',
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});
