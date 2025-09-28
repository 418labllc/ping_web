import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, userStateChange } from '../store/reducers/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux.hook';
import { fetchCurrentUser, useCreateUser, useCurrentUser } from '../hooks/services/useUser.hook';
import CustomHeader from '../../components/layout/CustomHeader';

export default function Layout() {
  const [userUID, setuserUID] = useState<string>('');
  const [initializing, setInitializing] = useState(true);
  const currentUserObj = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const createUser = useCreateUser();
  const [error, setError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  // Handle user state changes
  async function onAuthStateChanged(user: any | null) {
    if (initializing) {
      setInitializing(false);
      console.log('Auth state changed');
    }

    if (user) {
      const uid = user.uid;
      setuserUID(uid);
      let userObj = null;
      try {
        userObj = await fetchCurrentUser();
      } catch (err) {
        // If fetching user fails (user does not exist), try to create user
        try {
          // Only include non-blank fields
          const newUser: { email?: string; phone?: string } = {};
          if (user.email && user.email.trim() !== '') newUser.email = user.email;
          if (user.phoneNumber && user.phoneNumber.trim() !== '') newUser.phone = user.phoneNumber;
          if (newUser.email || newUser.phone) {
            userObj = await createUser.mutateAsync(newUser);
            console.log('User created:', userObj);
          } else {
            console.warn('No valid email or phone to create user.');
          }
        } catch (createErr) {
          console.error('User creation failed:', createErr);
        }
      }
      if (userObj) {
        dispatch(
          userStateChange({
            loaded: true,
            currentUser: userObj,
          })
        );
      }
    } else {
      dispatch(userStateChange({ loaded: true, currentUser: null }));
    }
  }

  return (
    <Tabs screenOptions={{ headerShown: true, tabBarStyle: { backgroundColor: '#323232' }, header: ({ route }) => <CustomHeader title={route.name} />, }}>

      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="user" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="category/[slug]"

        options={{
          href: null,
          title: 'Subs',
          tabBarIcon: ({ color, size }: any) => <FontAwesome name="id-card" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
