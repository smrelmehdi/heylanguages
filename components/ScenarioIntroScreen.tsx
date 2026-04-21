import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View, Image } from 'react-native';

const { height } = Dimensions.get('window');
const imageHeight = height * 0.60;

interface Props {
  image: any;
  badge: string;
  title: string;
  description: string;
  pills: string[];
  stats: string[];
  buttonText: string;
  onStart: () => void;
}

export default function ScenarioIntroScreen({ image, badge, title, description, pills, stats, buttonText, onStart }: Props) {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Image */}
      <View style={{ height: imageHeight, width: '100%' }}>
        <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.7)', '#0A0A0A']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 }}
        />
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
          style={{
            position: 'absolute', top: 48, left: 16,
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft color="#fff" size={20} />
        </Pressable>
      </View>

      {/* All content + button — no gap, button naturally at bottom */}
      <View style={styles.panel}>
        <View>
          <Text style={styles.badge}>{badge}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={3}>{description}</Text>

          <View style={styles.pillsRow}>
            {pills.map((p, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pillsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statPill}>
                <Text style={styles.statText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>{buttonText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  badge: { fontSize: 11, color: '#00897B', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  description: { fontSize: 12, color: '#888', lineHeight: 18, marginBottom: 14 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  pill: {
    backgroundColor: '#161616', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 11, color: '#FFF' },
  statPill: {
    backgroundColor: '#161616', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  statText: { fontSize: 11, color: '#555' },
  startButton: {
    backgroundColor: '#00897B', height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24,
  },
  startButtonText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
});
