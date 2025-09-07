import React from 'react';

// Import  global CSS file
import { Stack } from 'expo-router';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export const unstableSettings = {
  // Ensure that reloading on `/auth` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return <RootLayoutNav />;
}
