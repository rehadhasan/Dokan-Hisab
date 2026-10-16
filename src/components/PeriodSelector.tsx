import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface PeriodSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export function PeriodSelector({ label, onPrev, onNext, nextDisabled }: PeriodSelectorProps) {
  const { colors, radii } = useTheme();

  const handlePrev = () => {
    Haptics.selectionAsync();
    onPrev();
  };
  const handleNext = () => {
    if (nextDisabled) return;
    Haptics.selectionAsync();
    onNext();
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handlePrev}
        hitSlop={8}
        style={[styles.arrowBtn, { backgroundColor: colors.surface, borderRadius: radii.pill, borderColor: colors.border }]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>
      <AppText weight="semibold" size={14}>
        {label}
      </AppText>
      <Pressable
        onPress={handleNext}
        hitSlop={8}
        style={[
          styles.arrowBtn,
          { backgroundColor: colors.surface, borderRadius: radii.pill, borderColor: colors.border, opacity: nextDisabled ? 0.4 : 1 },
        ]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
