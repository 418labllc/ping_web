import { View, Text, StyleSheet, Linking } from 'react-native';

export default function Support() {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Support</Text>
                <Text style={styles.body}>
                    Need help or have questions? Our team is here for you.
                </Text>
                <Text style={styles.body}>
                    Email us at{' '}
                    <Text style={styles.link} onPress={() => Linking.openURL('mailto:info@ping.com')}>
                        support@ping.com
                    </Text>
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
    link: {
        fontSize: 16,
        color: '#007aff',
        textDecorationLine: 'underline',
    },
});
