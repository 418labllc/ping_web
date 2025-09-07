import { View, Text, StyleSheet } from 'react-native';

export default function PrivacyPolicy() {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.body}>
                    Your privacy is important to us. We only collect the minimum information necessary to provide our services.
                </Text>
                <Text style={styles.body}>
                    <Text style={styles.bold}>Firebase:</Text> Ping uses Firebase for authentication and backend services. Firebase may collect device and usage information as described in their privacy policy.
                </Text>
                <Text style={styles.body}>
                    We do not sell your data. For questions, contact us at info@ping.com.
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
});
