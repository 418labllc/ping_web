import { View, Pressable, Text } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export type NavBarCommonProps = {
  title: string;
  rightButton?: { show: boolean; name: any; action?: Function };
};

export default function NavBarCommon({
  title,
  rightButton = { show: false, name: 'arrow-down' },
}: NavBarCommonProps) {
  const navigation = useNavigation();
  const { show } = rightButton;
  return (
    <View className="flex-row items-center justify-between bg-white">
      <Pressable className="px-3 py-5" onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={26} />
      </Pressable>
      <View>
        <Text className="text-lg font-bold"> {title}</Text>
      </View>
      <Pressable
        className="px-3 py-5"
        onPress={() =>
          rightButton.action && rightButton.show ? rightButton.action() : null
        }
      >
        <Feather
          name={rightButton.name}
          size={26}
          color={show ? 'black' : 'white'}
        />
      </Pressable>
    </View>
  );
}
