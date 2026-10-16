import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCreditStore } from '@/store/useCreditStore';
import { getCredit, listPayments } from '@/db/repositories/credits';
import { formatAmount } from '@/utils/numberFormat';
import { formatDisplayDate, todayIso } from '@/utils/dateFormat';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StatusBadge } from '@/components/StatusBadge';
import { CenterModal } from '@/components/CenterModal';
import { DatePickerField } from '@/components/DatePickerField';
import type { RootStackParamList } from '@/navigation/types';
import type { CreditPayment, CreditWithPaid } from '@/types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'CreditDetail'>;

export function CreditDetailScreen({ route, navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const addPayment = useCreditStore((s) => s.addPayment);
  const removePayment = useCreditStore((s) => s.removePayment);
  const removeCredit = useCreditStore((s) => s.removeCredit);
  const refreshToken = useCreditStore((s) => s.refreshToken);

  const { creditId } = route.params;
  const [credit, setCredit] = useState<CreditWithPaid | null>(null);
  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayIso());
  const [payNote, setPayNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    getCredit(creditId).then(setCredit);
    listPayments(creditId).then(setPayments);
  }, [creditId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  if (!credit) return null;

  const isGiven = credit.direction === 'given';
  const accentColor = isGiven ? colors.income : colors.expense;

  const handleAddPayment = async () => {
    const numericAmount = parseFloat(payAmount);
    if (!numericAmount || numericAmount <= 0) {
      setError('সঠিক পরিমাণ লিখুন');
      return;
    }
    if (numericAmount > credit.remaining) {
      setError('বাকি পরিমাণের চেয়ে বেশি হতে পারবে না');
      return;
    }
    setSaving(true);
    try {
      await addPayment({ creditId: credit.id, amount: numericAmount, paymentDate: payDate, note: payNote.trim() || null });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setPayAmount('');
      setPayNote('');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = (payment: CreditPayment) => {
    Alert.alert('পেমেন্ট মুছবেন?', undefined, [
      { text: 'বাতিল', style: 'cancel' },
      { text: 'মুছুন', style: 'destructive', onPress: () => removePayment(payment.id, credit.id) },
    ]);
  };

  const handleDeleteCredit = () => {
    Alert.alert('এই এন্ট্রি মুছবেন?', 'সব পেমেন্ট হিস্টোরিসহ স্থায়ীভাবে মুছে যাবে', [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'মুছুন',
        style: 'destructive',
        onPress: async () => {
          await removeCredit(credit.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: colors.incomeBg, borderRadius: radii.pill }]}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText weight="bold" size={19}>
              {credit.person_name}
            </AppText>
            <AppText size={13} color={colors.textMuted}>
              {formatDisplayDate(credit.credit_date, digitFormat)} · {isGiven ? 'বাকি দিয়েছি' : 'বাকি নিয়েছি'}
            </AppText>
          </View>
          <Pressable onPress={handleDeleteCredit} hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color={colors.expense} />
          </Pressable>
        </View>

        {!!credit.note && (
          <AppText size={13} color={colors.textMuted} style={{ marginTop: 10 }}>
            {credit.note}
          </AppText>
        )}

        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}>
          <View style={styles.summaryItem}>
            <AppText size={12} color={colors.textMuted}>
              মোট
            </AppText>
            <AppText weight="bold" size={17}>
              {formatAmount(credit.amount, digitFormat)}
            </AppText>
          </View>
          <View style={styles.summaryItem}>
            <AppText size={12} color={colors.textMuted}>
              পরিশোধিত
            </AppText>
            <AppText weight="bold" size={17} color={colors.income}>
              {formatAmount(credit.paid_amount, digitFormat)}
            </AppText>
          </View>
          <View style={styles.summaryItem}>
            <AppText size={12} color={colors.textMuted}>
              বাকি
            </AppText>
            <AppText weight="bold" size={17} color={accentColor}>
              {formatAmount(credit.remaining, digitFormat)}
            </AppText>
          </View>
        </View>

        <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
          <StatusBadge status={credit.status} />
        </View>

        {credit.status === 'due' && (
          <Button
            label="আংশিক পরিশোধ যোগ করুন"
            onPress={() => setModalVisible(true)}
            style={{ marginTop: spacing.lg, backgroundColor: accentColor }}
          />
        )}

        <AppText weight="bold" size={16} style={{ marginTop: spacing.xl, marginBottom: 12 }}>
          পেমেন্ট হিস্টোরি
        </AppText>

        {payments.length === 0 ? (
          <AppText size={13} color={colors.textMuted}>
            এখনো কোনো পেমেন্ট হয়নি
          </AppText>
        ) : (
          payments.map((p) => (
            <View
              key={p.id}
              style={[styles.paymentRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md }]}
            >
              <View style={{ flex: 1 }}>
                <AppText weight="semibold" size={14}>
                  {formatAmount(p.amount, digitFormat)}
                </AppText>
                <AppText size={12} color={colors.textMuted}>
                  {formatDisplayDate(p.payment_date, digitFormat)}
                  {p.note ? ` · ${p.note}` : ''}
                </AppText>
              </View>
              <Pressable onPress={() => handleDeletePayment(p)} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <CenterModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <AppText weight="bold" size={17} style={{ marginBottom: 16 }}>
          আংশিক পরিশোধ যোগ করুন
        </AppText>

        <AppText weight="semibold" size={13} style={{ marginBottom: 6 }}>
          পরিমাণ (সর্বোচ্চ {formatAmount(credit.remaining, digitFormat)})
        </AppText>
        <View style={styles.amountRow}>
          <AppText weight="bold" size={22} color={accentColor}>
            ৳
          </AppText>
          <TextInput
            value={payAmount}
            onChangeText={(v) => {
              setPayAmount(v.replace(/[^0-9.]/g, ''));
              setError('');
            }}
            placeholder="০"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: accentColor }]}
            autoFocus
          />
        </View>

        <AppText weight="semibold" size={13} style={{ marginTop: 14, marginBottom: 6 }}>
          তারিখ
        </AppText>
        <DatePickerField value={payDate} onChange={setPayDate} />

        <TextInput
          value={payNote}
          onChangeText={setPayNote}
          placeholder="নোট (ঐচ্ছিক)"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.noteInput,
            { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        {!!error && (
          <AppText color={colors.expense} size={13} style={{ marginTop: 8 }}>
            {error}
          </AppText>
        )}

        <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: 10 }}>
          <Button label="বাতিল" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
          <Button
            label="যোগ করুন"
            onPress={handleAddPayment}
            loading={saving}
            style={{ flex: 1, backgroundColor: accentColor }}
          />
        </View>
      </CenterModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { flexDirection: 'row', borderWidth: 1, padding: 16, marginTop: 20 },
  summaryItem: { flex: 1, alignItems: 'center' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountInput: { fontFamily: fonts.bold, fontSize: 24, marginLeft: 6, minWidth: 60 },
  noteInput: { height: 46, borderWidth: 1.5, paddingHorizontal: 14, marginTop: 14, fontFamily: fonts.regular, fontSize: 14 },
});
