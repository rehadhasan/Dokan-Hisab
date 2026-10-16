import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
}

export function ScreenContainer({ children, style, edges = ['top', 'left', 'right'] }: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.flex, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
