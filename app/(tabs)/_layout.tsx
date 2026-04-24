import { Tabs } from 'expo-router';
import { BookOpen, MessageCircle, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { theme } from '../../constants/theme';

const TAB_META: Record<string, { label: string; Icon: typeof BookOpen }> = {
  index:   { label: 'Learn',   Icon: BookOpen },
  chat:    { label: 'Chat',    Icon: MessageCircle },
  profile: { label: 'Profile', Icon: User },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index"   options={{ title: 'Learn' }} />
      <Tabs.Screen name="chat"    options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 8) + 10;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: bottomOffset }]}>
      <View style={[styles.pillBlur, { backgroundColor: 'rgba(42, 39, 52, 0.98)' }]}>
        <View style={styles.pill}>
          {state.routes.map((route, index) => {
            const meta = TAB_META[route.name];
            if (!meta) return null;
            const focused = state.index === index;
            return (
              <TabButton
                key={route.key}
                label={meta.label}
                Icon={meta.Icon}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name as never);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabButton({ label, Icon, focused, onPress }: {
  label: string;
  Icon: typeof BookOpen;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 18, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 300 }); }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      hitSlop={8}
    >
      <Animated.View style={[focused ? styles.tabActive : styles.tabInactive, animatedStyle]}>
        <Icon
          size={20}
          color={focused ? theme.colors.accentPrimary : theme.colors.textTertiary}
          strokeWidth={2}
        />
        {focused && <Text style={styles.tabLabel}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export const TAB_BAR_CLEARANCE = 96;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pillBlur: {
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 39, 52, 0.95)',
    padding: 5,
    borderRadius: theme.radii.pill,
    gap: 2,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.bgElevated,
  },
  tabInactive: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: theme.radii.pill,
  },
  tabLabel: {
    color: theme.colors.accentPrimary,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
  },
});
