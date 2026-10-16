import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import type { CreditStatus } from '@/types/models';
import { AppText } from './AppText';

interface StatusBadgeProps {
  status: CreditStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors, radii } = useTheme();
  const isPaid = status === 'paid';
  const bg = isPaid ? colors.incomeBg : 'rgba(217, 119, 6, 0.16)';
  const fg = isPaid ? colors.income : colors.warning;

  return (
    <View style={{ backgroundColor: bg, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <AppText weight="semibold" size={11} color={fg}>
        {isPaid ? 'পরিশোধ হয়েছে' : 'বাকি আছে'}
      </AppText>
    </View>
  );
}
