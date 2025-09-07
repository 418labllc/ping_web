import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import {
    getAuth,
} from 'firebase/auth';

const EmailLinkAuthPage: React.FC = () => {
    const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'prompt'>('pending');
    const [error, setError] = useState<string | null>(null);
    const [promptedEmail, setPromptedEmail] = useState('');
    const router = useRouter();
    const auth = getAuth();

    const [showEmailPrompt, setShowEmailPrompt] = useState(false);
    const [inputEmail, setInputEmail] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    // Move doSignIn outside useEffect so it can be reused
    const doSignIn = async (providedEmail?: string) => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn') || providedEmail;
            if (!email) {
                setShowEmailPrompt(true);
                return;
            }
            try {
                const userCredential = await signInWithEmailLink(auth, email, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
                setStatus('success');
                setTimeout(() => {
                    router.replace('/');
                }, 1500);
            } catch (err: any) {
                setError(err.message || 'Failed to sign in with email link.');
                setStatus('error');
            }
        } else {
            setError('Invalid or expired sign-in link.');
            setStatus('error');
        }
    };

    useEffect(() => {
        doSignIn();
    }, [router]);

    const handleEmailSubmit = async () => {
        if (!inputEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inputEmail)) {
            setInputError('Please enter a valid email address.');
            return;
        }
        setInputError(null);
        setShowEmailPrompt(false);
        setStatus('pending');
        await new Promise((r) => setTimeout(r, 100)); // let UI update
        await doSignIn(inputEmail);
    };

    return (
        <View style={styles.container}>
            {showEmailPrompt ? (
                <div style={{
                    background: '#f8f8f8',
                    borderRadius: 8,
                    padding: 24,
                    alignItems: 'center',
                    minWidth: 320,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // web only
                    margin: 'auto',
                }}>
                    <Text style={styles.promptText}>Please enter your email to complete sign-in:</Text>
                    <input
                        type="email"
                        value={inputEmail}
                        onChange={e => setInputEmail(e.target.value)}
                        style={{
                            padding: 8,
                            fontSize: 16,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                            marginTop: 12,
                            width: 260,
                        }}
                        placeholder="your@email.com"
                        autoFocus
                    />
                    {inputError && <Text style={styles.errorText}>{inputError}</Text>}
                    <button
                        style={{
                            marginTop: 16,
                            backgroundColor: '#4092c6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                        }}
                        onClick={handleEmailSubmit}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <>
                    {status === 'pending' && <ActivityIndicator size="large" color="#4092c6" />}
                    {status === 'success' && <Text style={styles.successText}>Sign-in successful! Redirecting...</Text>}
                    {status === 'error' && <Text style={styles.errorText}>{error}</Text>}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400, // use a numeric value for React Native compatibility
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    successText: {
        color: 'green',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    promptText: {
        fontSize: 16,
        color: '#222',
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default EmailLinkAuthPage;

