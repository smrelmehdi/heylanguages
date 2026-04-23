import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

interface CafeSceneProps {
  arabic: string;
  transliteration: string;
  isWaiterSpeaking: boolean;
  isUserTurn: boolean;
  backgroundImage?: any;
}

export default function CafeScene({ arabic, transliteration, isWaiterSpeaking, backgroundImage }: CafeSceneProps) {
  return (
    <View style={styles.stage}>
      <Image
        source={backgroundImage ?? require('../assets/images/cafe-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={[styles.bubble, isWaiterSpeaking ? styles.waiterBubble : styles.yusufBubble]}>
        <Text style={styles.bubbleText}>{arabic}</Text>
        <Text style={styles.translationText}>{transliteration}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bubble: {
    backgroundColor: theme.colors.bgSurface,
    padding: 10,
    borderRadius: theme.radii.md,
    maxWidth: '70%',
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  yusufBubble: {
    top: 16,
    left: '15%',
    borderColor: theme.colors.borderAccent,
  },
  waiterBubble: {
    top: 16,
    right: '15%',
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  translationText: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
