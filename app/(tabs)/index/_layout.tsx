import React from 'react';
import { Stack } from 'expo-router';
export {
  ErrorBoundary,
} from 'expo-router';

function PingLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="faq"
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
          title: 'FAQ',
        }}
      />
    </Stack>
  );
}

export const unstableSettings = {
  initialRouteName: 'index',
};

export default function PingLayout() {
  return <PingLayoutNav />;
}
