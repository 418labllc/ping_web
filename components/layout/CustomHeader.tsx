import React from 'react';
import { View, Text, Image, Platform, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import StyleSheet from 'react-native-media-query';

const APKUrl = 'https://play.google.com/store/apps/details?id=host';
const IOSUrl = 'https://apps.apple.com/us/app/expo-go/id982107779';

const CustomHeader = ({ title }: { title: string }) => {
  const { ids, styles } = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#4092c6',
      padding: 10,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 50,
      height: 50,
      marginRight: 10,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 35,
      marginTop: 4,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'LeagueSpartanExtraBold',
    },
    downloadLinks: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#fff',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginLeft: 10,
    },
    linkButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
      marginLeft: 6,
    },
    storeIcon: {
      marginLeft: 10,
      width: 135,
      height: 40,
      '@media (max-width: 767px)': {
        width: 100,
        height: 30,
      },
    },
    loginButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      paddingVertical: 5,
      paddingHorizontal: 15,
    },
  });

  const isDesktop = Platform.OS === 'web';
  const router = useRouter();

  const handleAuthNavigation = () => {
    router.push('/profile');
  };

  return (
    <View
      style={styles.headerContainer}
      dataSet={{ media: ids.headerContainer }}
    >
      <View style={styles.leftContainer} dataSet={{ media: ids.leftContainer }}>
        <Image
          source={require('../../assets/images/sub.png')}
          style={styles.logo}
          dataSet={{ media: ids.logo }}
        />
        <Text style={styles.title} dataSet={{ media: ids.title }}>
          sub
        </Text>
      </View>
      <View style={styles.rightContainer} dataSet={{ media: ids.rightContainer }}>
        {isDesktop && (
          <View style={styles.downloadLinks} dataSet={{ media: ids.downloadLinks }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(IOSUrl)}
              accessibilityLabel="Download on the App Store"
            >
              <Image
                source={require('../../assets/images/appStore.png')}
                style={styles.storeIcon}
                dataSet={{ media: ids.storeIcon }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(APKUrl)}
              accessibilityLabel="Get it on Google Play"
            >
              <Image
                source={require('../../assets/images/playStore.png')}
                style={styles.storeIcon}
                dataSet={{ media: ids.storeIcon }}
              />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={handleAuthNavigation}>
          <Text style={styles.loginButtonText} dataSet={{ media: ids.loginButtonText }}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomHeader;
