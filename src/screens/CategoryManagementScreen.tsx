import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { CenterModal } from '@/components/CenterModal';
import type { Category, EntryType } from '@/types/models';

const ICON_OPTIONS: string[] = [
  'pricetag',
  'cash',
  'wallet',
  'cart',
  'home',
  'flash',
  'water',
  'car',
  'bicycle',
  'people',
  'gift',
  'construct',
  'medkit',
  'restaurant',
  'cafe',
  'shirt',
  'phone-portrait',
  'book',
  'briefcase',
  'ellipsis-horizontal',
];

function CategorySection({
  title,
  type,
  categories,
  accentColor,
  accentBg,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  type: EntryType;
  categories: Category[];
  accentColor: string;
  accentBg: string;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <View style={styles.sectionHeader}>
        <AppText weight="bold" size={16}>
          {title}
        </AppText>
        <Pressable onPress={onAdd} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add-circle" size={22} color={accentColor} />
        </Pressable>
      </View>
      {categories.map((cat) => (
        <View
          key={cat.id}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: accentBg, borderRadius: radii.md }]}>
            <Ionicons name={(cat.icon as any) || 'pricetag'} size={20} color={accentColor} />
          </View>
          <AppText weight="medium" size={15} style={{ flex: 1, marginLeft: spacing.sm }}>
            {cat.name}
          </AppText>
          <Pressable onPress={() => onEdit(cat)} hitSlop={8} style={{ marginRight: 14 }}>
            <Ionicons name="pencil" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={() => onDelete(cat)} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.expense} />
          </Pressable>
        </View>
      ))}
      {categories.length === 0 && (
        <AppText size={13} color={colors.textMuted}>
          কোনো ক্যাটাগরি নেই
        </AppText>
      )}
    </View>
  );
}

export function CategoryManagementScreen() {
  const { colors, spacing, radii } = useTheme();
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const categoriesByShop = useCategoryStore((s) => s.categoriesByShop);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const editCategory = useCategoryStore((s) => s.editCategory);
  const removeCategory = useCategoryStore((s) => s.removeCategory);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<EntryType>('income');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeShopId) loadCategories(activeShopId);
  }, [activeShopId, loadCategories]);

  const allCategories = activeShopId ? (categoriesByShop[activeShopId] ?? []) : [];
  const incomeCategories = allCategories.filter((c) => c.type === 'income');
  const expenseCategories = allCategories.filter((c) => c.type === 'expense');

  const openAdd = (type: EntryType) => {
    setModalType(type);
    setEditingId(null);
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setError('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setModalType(cat.type);
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon ?? ICON_OPTIONS[0]);
    setError('');
    setModalVisible(true);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('ক্যাটাগরি মুছবেন?', `"${cat.name}" মুছে ফেলা হবে। এই ক্যাটাগরির পুরোনো এন্ট্রিগুলো "অন্যান্য" হিসেবে দেখাবে।`, [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'মুছুন',
        style: 'destructive',
        onPress: () => activeShopId && removeCategory(activeShopId, cat.id),
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('ক্যাটাগরির নাম লিখুন');
      return;
    }
    if (!activeShopId) return;
    setSaving(true);
    try {
      if (editingId) {
        await editCategory(activeShopId, editingId, name.trim(), icon);
      } else {
        await addCategory(activeShopId, name.trim(), modalType, icon);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const accent = modalType === 'income' ? colors.income : colors.expense;
  const accentBgIncome = colors.incomeBg;
  const accentBgExpense = colors.expenseBg;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <CategorySection
          title="আয়ের ক্যাটাগরি"
          type="income"
          categories={incomeCategories}
          accentColor={colors.income}
          accentBg={accentBgIncome}
          onAdd={() => openAdd('income')}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        <CategorySection
          title="ব্যয়ের ক্যাটাগরি"
          type="expense"
          categories={expenseCategories}
          accentColor={colors.expense}
          accentBg={accentBgExpense}
          onAdd={() => openAdd('expense')}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </ScrollView>

      <CenterModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <AppText weight="bold" size={17} style={{ marginBottom: 16 }}>
          {editingId ? 'ক্যাটাগরি এডিট করুন' : modalType === 'income' ? 'নতুন আয়ের ক্যাটাগরি' : 'নতুন ব্যয়ের ক্যাটাগরি'}
        </AppText>

        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError('');
          }}
          placeholder="ক্যাটাগরির নাম"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        <AppText weight="semibold" size={13} style={{ marginTop: 14, marginBottom: 8 }}>
          আইকন বেছে নিন
        </AppText>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((opt) => {
            const active = opt === icon;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIcon(opt);
                }}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: active ? accent : colors.background,
                    borderRadius: radii.md,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name={opt as any} size={20} color={active ? colors.onPrimary : colors.text} />
              </Pressable>
            );
          })}
        </View>

        {!!error && (
          <AppText color={colors.expense} size={13} style={{ marginTop: 10 }}>
            {error}
          </AppText>
        )}

        <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: 10 }}>
          <Button label="বাতিল" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
          <Button
            label={editingId ? 'আপডেট' : 'যোগ করুন'}
            onPress={handleSave}
            loading={saving}
            style={{ flex: 1, backgroundColor: accent }}
          />
        </View>
      </CenterModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { padding: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, marginBottom: 8 },
  iconWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { height: 50, borderWidth: 1.5, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconOption: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
