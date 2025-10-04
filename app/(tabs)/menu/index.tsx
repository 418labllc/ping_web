import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ActiveCall() {
    const handleRequestHelp = () => {
        Alert.alert('Help Requested', 'A staff member will be with you shortly!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Active Call</Text>
            <Text style={styles.body}>
                Tap the button below to request help. A staff member will be notified and come to assist you as soon as possible.
            </Text>
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
