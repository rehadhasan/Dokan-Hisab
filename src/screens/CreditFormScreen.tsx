import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useCreditStore } from '@/store/useCreditStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getCredit } from '@/db/repositories/credits';
import { todayIso } from '@/utils/dateFormat';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { DatePickerField } from '@/components/DatePickerField';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreditForm'>;

export function CreditFormScreen({ route, navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const addCredit = useCreditStore((s) => s.addCredit);
  const editCredit = useCreditStore((s) => s.editCredit);

  const { direction, creditId } = route.params;
  const isEditing = !!creditId;

  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [creditDate, setCreditDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEditing);

  useEffect(() => {
    if (!creditId) return;
    getCredit(creditId).then((credit) => {
      if (!credit) return;
      setPersonName(credit.person_name);
      setAmount(String(credit.amount));
      setCreditDate(credit.credit_date);
      setNote(credit.note ?? '');
      setLoaded(true);
    });
  }, [creditId]);

  const accentColor = direction === 'given' ? colors.income : colors.expense;

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!personName.trim()) {
      setError('ব্যক্তির নাম লিখুন');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('সঠিক পরিমাণ লিখুন');
      return;
    }
    if (!activeShopId) return;

    setSaving(true);
    try {
      if (isEditing && creditId) {
        await editCredit(creditId, { personName: personName.trim(), amount: numericAmount, creditDate, note: note.trim() || null });
      } else {
        await addCredit({
          shopId: activeShopId,
          direction,
          personName: personName.trim(),
          amount: numericAmount,
          creditDate,
          note: note.trim() || null,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      setError('সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.handle} />
      </View>
      <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
        <AppText weight="bold" size={19}>
          {isEditing ? 'এডিট করুন' : direction === 'given' ? 'নতুন বাকি (দিয়েছি)' : 'নতুন বাকি (নিয়েছি)'}
        </AppText>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <AppText weight="semibold" size={14} style={styles.label}>
          ব্যক্তির নাম
        </AppText>
        <TextInput
          value={personName}
          onChangeText={(v) => {
            setPersonName(v);
            setError('');
          }}
          placeholder="যেমনঃ করিম মিয়া"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        <AppText weight="semibold" size={14} style={styles.label}>
          পরিমাণ
        </AppText>
        <View style={styles.amountRow}>
          <AppText weight="bold" size={28} color={accentColor}>
            ৳
          </AppText>
          <TextInput
            value={amount}
            onChangeText={(v) => {
              setAmount(v.replace(/[^0-9.]/g, ''));
              setError('');
            }}
            placeholder="০"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: accentColor }]}
          />
        </View>

        <AppText weight="semibold" size={14} style={styles.label}>
          তারিখ
        </AppText>
        <DatePickerField value={creditDate} onChange={setCreditDate} />

        <AppText weight="semibold" size={14} style={styles.label}>
          নোট (ঐচ্ছিক)
        </AppText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="যেমনঃ চাল বাকিতে দেওয়া হয়েছে"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.noteInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        {!!error && (
          <AppText color={colors.expense} size={13} style={{ marginTop: 10 }}>
            {error}
          </AppText>
        )}

        <Button
          label={isEditing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          onPress={handleSave}
          loading={saving}
          style={{ marginTop: spacing.lg, backgroundColor: accentColor }}
          haptic={false}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(150,150,150,0.4)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  label: { marginBottom: 8, marginTop: 16 },
  input: { height: 52, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountInput: { fontFamily: fonts.bold, fontSize: 30, marginLeft: 8, minWidth: 80 },
  noteInput: { height: 52, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 15 },
});
