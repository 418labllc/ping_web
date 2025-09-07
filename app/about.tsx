import { View, Text, StyleSheet, Linking } from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>About Ping</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Ping</Text> is a modern platform designed to help teams and businesses connect, collaborate, and get help fast.
        </Text>
        <Text style={styles.sectionTitle}>Our Work Philosophy</Text>
        <Text style={styles.body}>
          At Ping, we believe in a healthy work-life balance. That's why our team works a 4-day work week, with 8-hour days. We value productivity, focus, and time to recharge.
        </Text>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.link} onPress={() => Linking.openURL('mailto:info@ping.com')}>
          Want to learn more? Email us at info@ping.com
        </Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#333',
  },
  body: {
    fontSize: 16,
    marginBottom: 12,
    color: '#444',
    textAlign: 'left',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  link: {
    fontSize: 16,
    color: '#007aff',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
