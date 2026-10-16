import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/AppText';

export function SplashScreen() {
  const { colors, radii } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withSpring(1, { damping: 9, stiffness: 90 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.onPrimary, borderRadius: radii.xl }]}>
          <Ionicons name="storefront" size={56} color={colors.primary} />
        </View>
        <AppText weight="bold" size={30} color={colors.onPrimary} style={styles.title}>
          দোকান হিসাব
        </AppText>
        <AppText weight="medium" size={14} color={colors.onPrimary} style={styles.subtitle}>
          আপনার ব্যবসার হিসাব, এক জায়গায়
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  iconWrap: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { marginBottom: 6 },
  subtitle: { opacity: 0.9 },
});
