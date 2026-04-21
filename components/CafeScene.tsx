import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

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
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 14,
    maxWidth: '70%',
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  yusufBubble: {
    top: 16,
    left: '15%',
  },
  waiterBubble: {
    top: 16,
    right: '15%',
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  translationText: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
});
