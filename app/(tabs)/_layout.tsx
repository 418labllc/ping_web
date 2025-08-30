import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { View } from 'react-native';
import CustomHeader from '@/components/layout/CustomHeader';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: true, tabBarStyle: { backgroundColor: '#323232' }, header: ({ route }) => <CustomHeader title={route.name} />, }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ping',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="qrcode" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
