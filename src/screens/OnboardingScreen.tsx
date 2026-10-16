import { useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';

const SLIDES: Array<{ icon: keyof typeof Ionicons.glyphMap; title: string; description: string }> = [
  {
    icon: 'book-outline',
    title: 'দৈনিক হিসাব রাখুন সহজে',
    description: 'প্রতিদিনের আয়-ব্যয় এক ট্যাপে যোগ করুন, ইন্টারনেট ছাড়াই।',
  },
  {
    icon: 'people-outline',
    title: 'বাকি-দেনার হিসাব',
    description: 'কাকে বাকি দিয়েছেন, কার কাছে বাকি নিয়েছেন — সব থাকবে গুছানো।',
  },
  {
    icon: 'bar-chart-outline',
    title: 'গ্রাফে দেখুন আপনার ব্যবসা',
    description: 'রঙিন চার্টে বুঝুন কোথায় খরচ বেশি, কোথায় আয় বেশি।',
  },
];

function Dot({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 8, { duration: 200 }),
    opacity: withTiming(active ? 1 : 0.4, { duration: 200 }),
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, style]} />;
}

export function OnboardingScreen() {
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const setOnboardingSeen = useSettingsStore((s) => s.setOnboardingSeen);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    } else {
      setOnboardingSeen(true);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.skipRow}>
        <Button label="বাদ দিন" variant="ghost" onPress={() => setOnboardingSeen(true)} haptic={false} />
      </View>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.incomeBg, borderRadius: radii.xl }]}>
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </View>
            <AppText weight="bold" size={22} style={styles.title}>
              {item.title}
            </AppText>
            <AppText weight="regular" size={15} color={colors.textMuted} style={styles.description}>
              {item.description}
            </AppText>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <Dot key={s.title} active={i === index} />
        ))}
      </View>
      <View style={styles.footer}>
        <Button label={index === SLIDES.length - 1 ? 'শুরু করুন' : 'পরবর্তী'} onPress={handleNext} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  skipRow: { alignItems: 'flex-end', paddingHorizontal: 12 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title: { textAlign: 'center', marginBottom: 12 },
  description: { textAlign: 'center', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 },
});
