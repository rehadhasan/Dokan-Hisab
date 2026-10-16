import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatDisplayDate, formatWeekday, todayIso, toIsoDate } from '@/utils/dateFormat';
import { AppText } from './AppText';

interface DatePickerFieldProps {
  value: string;
  onChange: (iso: string) => void;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const { colors, radii } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) onChange(toIsoDate(date));
  };

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md }]}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <AppText weight="medium" size={15} style={{ marginLeft: 10 }}>
          {formatDisplayDate(value, digitFormat)} · {formatWeekday(value)}
        </AppText>
        {value === todayIso() && (
          <AppText size={12} color={colors.primary} style={{ marginLeft: 8 }}>
            (আজ)
          </AppText>
        )}
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={new Date(`${value}T00:00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
});
