import React, { useEffect, useState, useMemo } from 'react';
import { Platform, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SignupLoginPageNative from '../../components/auth/SignupLoginPage';
import { selectAuth } from '../store/reducers/authSlice';
import SignupLoginPageWeb from '../../components/auth/SignupLoginPage.web';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { useAppSelector } from '@/hooks/redux.hook';

const funBackMessages = [
  "Let’s taco 'bout going back.",
  "Back for seconds!",
  "Return to the comfort food zone.",
  "Rewind to a slice of pizza.",
  "Back to the pantry… for more snacks!",
  "This way to the cookie jar!",
  "Back to the bread and butter.",
  "Let’s ketchup on things!",
  "I’m going back for dessert!",
  "Back to the salad bar!",
  "Take me back before I overcooked it.",
  "Back to where the chips are fresh!",
  "Going back to the lunchbox!",
  "Back to the sweet side of life!",
  "Returning to the chocolate fountain!",
  "Going back for that extra scoop!",
  "Back to where the flavor is!",
  "Back to the breakfast table!",
  "Back to the fruit bowl!",
  "Back to the soup station!",
  "Back to the spice rack!",
  "Back to the picnic blanket!",
  "Back to the smoothie bar!",
  "Back to the veggie patch!",
  "Back to the cheese board!",
  "Back to the oven mitts!",
  "Back to the recipe book!",
  "Back to the snack drawer!",
  "Back to the ice cream truck!",
  "Back to the lemonade stand!",
  "Back to the grill!",
  "Back to the brunch bunch!",
  "Back to the main course!",
  "Back to the buffet!",
  "Back to the kitchen table!",
  "Back to the garden salad!",
  "Back to the pancake stack!",
  "Back to the popcorn bowl!",
  "Back to the bakery!",
  "Back to the coffee pot!",
  "Back to the teapot!",
  "Back to the croutons!",
  "Back to the pie chart!",
  "Back to flavor town!",
  "Back to the comfort zone!",
  "Back to the snack attack!",
  "Back to the food truck!",
  "Back to the kitchen crew!",
  "Back to the lunch line!",
  "Back to the dessert tray!",
  "Back to the pizza party!",
  "Back to the sandwich shop!",
  "Back to the soup pot!",
  "Back to the salad spinner!",
  "Back to the breakfast club!",
  "Back to the dinner table!",
  "Back to the food court!",
  "Back to the chef’s hat!",
  "Back to the grocery list!",
  "Back to the spice cabinet!",
  "Back to the kitchen timer!",
  "Back to the rolling pin!",
  "Back to the mixing bowl!",
  "Back to the snack bar!",
  "Back to the food festival!",
  "Back to the kitchen lights!",
];


const getRandomBackMessage = () => funBackMessages[Math.floor(Math.random() * funBackMessages.length)];

const SignupLoginPage = () => {
  const { loaded, currentUser } = useAppSelector(selectAuth);
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [redirectActive, setRedirectActive] = useState(false);
  const backMessage = useMemo(getRandomBackMessage, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }}>
        <LoadingIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }}>
        <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 24 }}>
          You are already signed in.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#4092c6', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}>
            {backMessage}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return <SignupLoginPageWeb />;
  }
  return <SignupLoginPageNative />;
};

export default SignupLoginPage;
