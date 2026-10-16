import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface ToggleTabsProps {
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (key: string) => void;
  activeColor?: string;
}

export function ToggleTabs({ options, value, onChange, activeColor }: ToggleTabsProps) {
  const { colors, radii } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const innerWidth = Math.max(0, containerWidth - 6);
  const segmentWidth = innerWidth / options.length;
  const activeIndex = Math.max(0, options.findIndex((o) => o.key === value));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(activeIndex * segmentWidth, { duration: 220 }) }],
    width: segmentWidth,
  }));

  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, { backgroundColor: colors.background, borderRadius: radii.pill, borderColor: colors.border }]}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.pill,
            animatedStyle,
            { backgroundColor: activeColor ?? colors.primary, borderRadius: radii.pill },
          ]}
        />
      )}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            style={styles.segment}
            onPress={() => {
              if (option.key !== value) {
                Haptics.selectionAsync();
                onChange(option.key);
              }
            }}
          >
            <AppText weight={active ? 'semibold' : 'medium'} color={active ? colors.onPrimary : colors.textMuted} size={14}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1,
    padding: 3,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
