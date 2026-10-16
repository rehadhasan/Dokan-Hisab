import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useEntryStore } from '@/store/useEntryStore';
import { getEntry } from '@/db/repositories/entries';
import { todayIso } from '@/utils/dateFormat';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ToggleTabs } from '@/components/ToggleTabs';
import { CategoryChip } from '@/components/CategoryChip';
import { DatePickerField } from '@/components/DatePickerField';
import type { RootStackParamList } from '@/navigation/types';
import type { EntryType } from '@/types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEntry'>;

export function AddEntryScreen({ route, navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const categoriesByShop = useCategoryStore((s) => s.categoriesByShop);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const addEntry = useEntryStore((s) => s.addEntry);
  const editEntry = useEntryStore((s) => s.editEntry);
  const removeEntry = useEntryStore((s) => s.removeEntry);

  const entryId = route.params?.entryId;
  const isEditing = !!entryId;

  const [type, setType] = useState<EntryType>('income');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEditing);

  useEffect(() => {
    if (activeShopId) loadCategories(activeShopId);
  }, [activeShopId, loadCategories]);

  useEffect(() => {
    if (!entryId) return;
    getEntry(entryId).then((entry) => {
      if (!entry) return;
      setType(entry.type);
      setAmount(String(entry.amount));
      setCategoryId(entry.category_id);
      setEntryDate(entry.entry_date);
      setNote(entry.note ?? '');
      setLoaded(true);
    });
  }, [entryId]);

  const categories = useMemo(() => {
    if (!activeShopId) return [];
    return (categoriesByShop[activeShopId] ?? []).filter((c) => c.type === type);
  }, [categoriesByShop, activeShopId, type]);

  useEffect(() => {
    if (!isEditing && categoryId === null && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, isEditing]);

  const handleTypeChange = (key: string) => {
    const nextType = key as EntryType;
    setType(nextType);
    setCategoryId(null);
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('সঠিক পরিমাণ লিখুন');
      return;
    }
    if (!categoryId) {
      setError('একটি ক্যাটাগরি বেছে নিন');
      return;
    }
    if (!activeShopId) return;

    setSaving(true);
    try {
      if (isEditing && entryId) {
        await editEntry(entryId, { type, amount: numericAmount, categoryId, entryDate, note: note.trim() || null });
      } else {
        await addEntry({ shopId: activeShopId, type, amount: numericAmount, categoryId, entryDate, note: note.trim() || null });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      setError('সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!entryId) return;
    Alert.alert('এন্ট্রি মুছবেন?', 'এই এন্ট্রি স্থায়ীভাবে মুছে যাবে', [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'মুছুন',
        style: 'destructive',
        onPress: async () => {
          await removeEntry(entryId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!loaded) return null;

  const typeColor = type === 'income' ? colors.income : colors.expense;
  const typeBg = type === 'income' ? colors.incomeBg : colors.expenseBg;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <View style={styles.handle} />
        </View>
        <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
          <AppText weight="bold" size={19}>
            {isEditing ? 'এন্ট্রি এডিট করুন' : 'নতুন এন্ট্রি'}
          </AppText>
          <View style={{ flexDirection: 'row' }}>
            {isEditing && (
              <Pressable onPress={handleDelete} hitSlop={10} style={{ marginRight: 16 }}>
                <Ionicons name="trash-outline" size={22} color={colors.expense} />
              </Pressable>
            )}
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
          <ToggleTabs
            options={[
              { key: 'income', label: 'আয়' },
              { key: 'expense', label: 'ব্যয়' },
            ]}
            value={type}
            onChange={handleTypeChange}
            activeColor={typeColor}
          />

          <View style={styles.amountRow}>
            <AppText weight="bold" size={32} color={typeColor}>
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
              style={[styles.amountInput, { color: typeColor }]}
              autoFocus={!isEditing}
            />
          </View>

          <AppText weight="semibold" size={14} style={styles.label}>
            ক্যাটাগরি
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                icon={cat.icon}
                active={cat.id === categoryId}
                onPress={() => setCategoryId(cat.id)}
                activeColor={typeColor}
                activeBg={typeBg}
              />
            ))}
            {categories.length === 0 && (
              <AppText size={13} color={colors.textMuted}>
                কোনো ক্যাটাগরি নেই, সেটিংস থেকে যোগ করুন
              </AppText>
            )}
          </ScrollView>

          <AppText weight="semibold" size={14} style={styles.label}>
            তারিখ
          </AppText>
          <DatePickerField value={entryDate} onChange={setEntryDate} />

          <AppText weight="semibold" size={14} style={styles.label}>
            নোট (ঐচ্ছিক)
          </AppText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="যেমনঃ বিকাশে পেমেন্ট"
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

          <Animated.View entering={FadeIn}>
            <Button
              label={isEditing ? 'আপডেট করুন' : 'সেভ করুন'}
              onPress={handleSave}
              loading={saving}
              style={{ marginTop: spacing.lg, backgroundColor: typeColor }}
              haptic={false}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(150,150,150,0.4)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  amountInput: { fontFamily: fonts.bold, fontSize: 44, marginLeft: 8, minWidth: 80, textAlign: 'left' },
  label: { marginBottom: 8, marginTop: 20 },
  noteInput: { height: 52, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 15 },
});
