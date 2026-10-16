import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { createCharge, verifyPayment } from '@/services/uddoktapay/client';
import { isUddoktaPaySandbox } from '@/services/uddoktapay/config';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { UddoktaPayCheckoutModal, type UddoktaPayCallbackStatus } from '@/components/UddoktaPayCheckoutModal';

const BKASH_PINK = '#E2136E';
const QUICK_AMOUNTS = [50, 100, 200, 500];

export function DonateScreen() {
  const { colors, spacing, radii } = useTheme();
  const sandbox = isUddoktaPaySandbox();

  const [amount, setAmount] = useState('100');
  const [name, setName] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePay = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('ভুল পরিমাণ', 'সঠিক পরিমাণ লিখুন');
      return;
    }
    setPaying(true);
    try {
      const fullName = name.trim() || 'শুভাকাঙ্ক্ষী';
      const email = `donor+${Date.now()}@dokanhisab.app`;
      const result = await createCharge({
        fullName,
        email,
        amount: numericAmount,
        metadata: { source: 'donate-screen' },
      });
      if (!result.payment_url) {
        Alert.alert('ত্রুটি', 'পেমেন্ট পেজ লোড করা যায়নি');
        return;
      }
      setPaymentUrl(result.payment_url);
      setModalVisible(true);
    } catch (e) {
      Alert.alert('ত্রুটি', e instanceof Error ? e.message : 'পেমেন্ট শুরু করা যায়নি');
    } finally {
      setPaying(false);
    }
  };

  const handleCallback = async (status: UddoktaPayCallbackStatus, invoiceId: string | null) => {
    setModalVisible(false);
    if (status === 'cancel') return;
    if (!invoiceId) {
      Alert.alert('ত্রুটি', 'পেমেন্ট শনাক্ত করা যায়নি');
      return;
    }
    try {
      const result = await verifyPayment(invoiceId);
      if (result.status === 'COMPLETED') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('ধন্যবাদ! 🎉', `আপনার ৳${result.amount} পেমেন্ট সফল হয়েছে।`);
      } else if (result.status === 'PENDING') {
        Alert.alert('অপেক্ষমান', 'পেমেন্টটি এখনো প্রক্রিয়াধীন, একটু পরে আবার চেষ্টা করুন');
      } else {
        Alert.alert('ব্যর্থ', 'পেমেন্টটি সম্পন্ন হয়নি');
      }
    } catch (e) {
      Alert.alert('ত্রুটি', e instanceof Error ? e.message : 'পেমেন্ট যাচাই করা যায়নি');
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center' }}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.xl }]}>
          <View style={[styles.iconWrap, { backgroundColor: '#E2136E22', borderRadius: radii.xl }]}>
            <Ionicons name="heart" size={40} color={BKASH_PINK} />
          </View>
          <AppText weight="bold" size={19} style={{ textAlign: 'center', marginTop: 16 }}>
            আপনার সাপোর্ট আমাদের অনুপ্রেরণা দেয়
          </AppText>
          <AppText size={13} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            এই অ্যাপটি সম্পূর্ণ ফ্রি রাখতে এবং আরও ভালো ফিচার যোগ করতে আপনার ছোট সাপোর্ট অনেক বড় ভূমিকা রাখে।
          </AppText>

          {sandbox && (
            <View style={[styles.sandboxBadge, { backgroundColor: `${colors.warning}22`, borderRadius: radii.pill }]}>
              <AppText size={11} weight="semibold" color={colors.warning}>
                টেস্ট মোড (Sandbox) — কোনো টাকা কাটবে না
              </AppText>
            </View>
          )}

          <View style={styles.amountChipsRow}>
            {QUICK_AMOUNTS.map((a) => {
              const active = amount === String(a);
              return (
                <Pressable
                  key={a}
                  onPress={() => setAmount(String(a))}
                  style={[
                    styles.amountChip,
                    {
                      backgroundColor: active ? BKASH_PINK : colors.background,
                      borderColor: active ? BKASH_PINK : colors.border,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <AppText weight="semibold" size={13} color={active ? '#fff' : colors.text}>
                    ৳{a}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[styles.numberBox, { backgroundColor: colors.background, borderRadius: radii.lg, borderColor: colors.border }]}
          >
            <AppText weight="bold" size={20} color={BKASH_PINK}>
              ৳
            </AppText>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: colors.text }]}
            />
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="আপনার নাম (ঐচ্ছিক)"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.nameInput,
              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
            ]}
          />

          <Button
            label="বিকাশ/নগদ দিয়ে পেমেন্ট করুন"
            onPress={handlePay}
            loading={paying}
            style={{ marginTop: spacing.lg, backgroundColor: BKASH_PINK }}
          />
        </View>

        <AppText size={12} color={colors.textMuted} style={{ textAlign: 'center', marginTop: 20 }}>
          এটি সম্পূর্ণ ঐচ্ছিক — কোনো জোরপূর্বক পেমেন্ট নয়
        </AppText>
      </View>

      <UddoktaPayCheckoutModal
        visible={modalVisible}
        paymentUrl={paymentUrl}
        onCallback={handleCallback}
        onClose={() => setModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 24, alignItems: 'center' },
  iconWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  sandboxBadge: { paddingHorizontal: 12, paddingVertical: 5, marginTop: 14 },
  numberBox: {
    width: '100%',
    borderWidth: 1.5,
    padding: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    width: '100%',
    height: 46,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  amountChipsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  amountChip: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5 },
  amountInput: { fontFamily: fonts.bold, fontSize: 20, marginLeft: 8, minWidth: 60, textAlign: 'center' },
});
