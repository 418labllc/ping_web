import { View, Image } from 'react-native';
import React from 'react';

export type ProfileImageProps = {
  photoURL: string;
};

const ProfileImage = ({ photoURL }: ProfileImageProps) => {
  return (
    <View>
      <Image
        className="h-10 w-10  rounded-full  border-2 border-white bg-gray-300 p-2.5"
        source={{ uri: photoURL }}
      />
    </View>
  );
};

export default ProfileImage;
