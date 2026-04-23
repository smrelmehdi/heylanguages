import React, { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';

interface YusufAvatarProps {
  isListening?: boolean;
}

const YusufAvatar: React.FC<YusufAvatarProps> = ({ isListening }) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.03, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isListening) {
      glow.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    } else {
      glow.value = withTiming(0, { duration: 300 });
    }
  }, [isListening]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isListening ? scale.value * 1.1 : scale.value }],
      borderColor: interpolateColor(
        glow.value,
        [0, 1],
        ['rgba(61, 212, 192, 0)', theme.colors.borderAccent]
      ),
      borderWidth: isListening ? 4 : 0,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.avatarContainer, animatedStyle]}
      >
        <Image
          source={require('../assets/images/yusuf-welcome.png')}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});

export default YusufAvatar;
