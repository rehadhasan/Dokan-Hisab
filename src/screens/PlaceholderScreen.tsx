import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';

interface PlaceholderScreenProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function PlaceholderScreen({ title, icon = 'construct-outline' }: PlaceholderScreenProps) {
  const { colors, radii } = useTheme();
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated, borderRadius: radii.xl }]}>
          <Ionicons name={icon} size={40} color={colors.textMuted} />
        </View>
        <AppText weight="semibold" size={16} color={colors.textMuted}>
          {title} — শীঘ্রই আসছে
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
});
