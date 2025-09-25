import React, { useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
    findNodeHandle,
    Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const isMobile = width < 768;

export default function PingHome() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const faqRef = useRef<View>(null);

    const handleOpenCamera = () => {
        router.push('../camera');
    };

    const scrollToFaq = () => {
        if (Platform.OS === 'web') {
            if (typeof document !== 'undefined') {
                const el = document.getElementById('faq-section');
                if (el && (el as any).scrollIntoView) {
                    (el as any).scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            }
            // Fallback to native-like scroll if element not found
        }
        if (faqRef.current && scrollViewRef.current) {
            const scrollViewHandle = findNodeHandle(scrollViewRef.current);
            if (scrollViewHandle) {
                faqRef.current.measureLayout(
                    scrollViewHandle,
                    (x, y) => {
                        scrollViewRef.current?.scrollTo({ y, animated: true });
                    }
                );
            }
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                ref={scrollViewRef}
            >
                <View style={styles.fullscreenSection}>
                    <View style={styles.centeredContent}>
                        <Image
                            source={require('../../../assets/images/sub.png')}
                            style={styles.logo}
                        />
                        <Text style={styles.headerTitle}>ping</Text>
                        <Text style={styles.headerSubtitle}>
                            Scan QR code for help
                        </Text>
                        <View style={styles.cameraSection}>
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handleOpenCamera}
                            >
                                <FontAwesome name="camera" size={24} color="black" />
                                <Text style={styles.cameraButtonText}>Scan Now</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={scrollToFaq}>
                            <Text style={styles.scrollText}>How to Scan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.content}>
                    <View
                        style={[styles.section, { marginTop: 800 }]}
                        ref={faqRef}
                        nativeID="faq-section"
                    >
                        <Text style={styles.sectionTitle}>How to Request Help with ping</Text>
                        <Text style={styles.sectionContent}>
                            1. Tap the "Request Help" button on the main screen to notify staff or support that you need assistance.
                        </Text>
                        <Text style={styles.sectionContent}>
                            2. Your request will be sent instantly to the team, so you don't have to wait or wave for attention.
                        </Text>
                        <Text style={styles.sectionContent}>
                            3. Use ping to ask for help in restaurants, hotels, wholesale clubs, pet stores, offices, events, or anywhere you need quick support.
                        </Text>
                        <Text style={styles.sectionContent}>
                            Works in restaurants, hotels, wholesale clubs, and pet stores.
                        </Text>
                        <Text style={styles.sectionTitle}>Why use ping for help?</Text>
                        <Text style={styles.sectionContent}>
                            ping makes it easy to get service when you need it, without interrupting your conversation or searching for staff. It's fast, discreet, and designed to improve your experience in any setting.
                        </Text>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        <Text style={styles.sectionContent}>
                            <Ionicons name="help-circle-outline" size={24} color="white" /> How does ping notify staff or support?
                        </Text>
                        <Text style={styles.sectionContent}>
                            When you tap "Request Help," a notification is sent to the system so the team can respond quickly.
                        </Text>
                        <Text style={styles.sectionContent}>
                            <Ionicons name="help-circle-outline" size={24} color="white" /> What can I request help for?
                        </Text>
                        <Text style={styles.sectionContent}>
                            You can request help for anything: refills, extra napkins, the check, tech support, directions, or any other service you need.
                        </Text>
                        <Text style={styles.sectionContent}>
                            <Ionicons name="help-circle-outline" size={24} color="white" /> Is my request private?
                        </Text>
                        <Text style={styles.sectionContent}>
                            Yes, your request is sent directly to staff or support and is not visible to other guests or users.
                        </Text>
                        <Text style={styles.sectionContent}>
                            <Ionicons name="help-circle-outline" size={24} color="white" /> Can I chat with staff before they respond to my call?
                        </Text>
                        <Text style={styles.sectionContent}>
                            Yes! After you request help, you can start a chat with staff before they arrive to assist you. This lets you clarify your needs or ask questions in real time.
                        </Text>
                        <Text style={styles.sectionContent}>
                            <Ionicons name="help-circle-outline" size={24} color="white" /> Do I need to download an app?
                        </Text>
                        <Text style={styles.sectionContent}>
                            No app is required. You can request help directly from your browser using ping.
                        </Text>
                    </View>
                </View>
                <View className="footer" style={styles.footer}>
                    <Link href="../terms-of-service" style={styles.footerLink}>Terms of Service</Link>
                    <Link href="../support" style={styles.footerLink}>Support</Link>
                    <Link href="../privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
                    <Link href="../about" style={styles.footerLink}>About</Link>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#323232',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    fullscreenSection: {
        minHeight: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1a1a1a',
    },
    centeredContent: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    logo: {
        width: 140,
        height: 120,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 40,
        fontFamily: 'LeagueSpartanExtraBold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'lowercase',
    },
    headerSubtitle: {
        fontSize: 18,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    cameraSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cameraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cameraButtonText: {
        marginLeft: 10,
        fontSize: 18,
        color: '#000',
    },
    scrollText: {
        marginTop: 20,
        fontSize: 18,
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a1a',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#404040',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    sectionContent: {
        fontSize: 16,
        marginBottom: 10,
        color: '#ccc',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 20,
        backgroundColor: '#333',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    footerLink: {
        fontSize: 16,
        color: 'white',
        marginBottom: 10,
    },
});
