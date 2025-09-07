import React from 'react';
import { Stack } from 'expo-router';

export {
    ErrorBoundary,
} from 'expo-router';

function AuthLayoutNav() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="email-link" options={{ headerShown: false }} />
        </Stack>
    );
}

export const unstableSettings = {
    initialRouteName: 'index',
};

export default function AuthLayout() {
    return <AuthLayoutNav />;
}
