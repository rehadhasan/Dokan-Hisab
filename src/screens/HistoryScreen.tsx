import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useEntryStore } from '@/store/useEntryStore';
import { listEntries, type EntryFilters } from '@/db/repositories/entries';
import { formatDisplayDate, formatWeekday } from '@/utils/dateFormat';
import { formatAmount } from '@/utils/numberFormat';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ToggleTabs } from '@/components/ToggleTabs';
import { CategoryChip } from '@/components/CategoryChip';
import { EntryListItem } from '@/components/EntryListItem';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { EntryType, EntryWithCategory } from '@/types/models';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'History'>, NativeStackScreenProps<RootStackParamList>>;

type TypeFilter = 'all' | EntryType;

interface Section {
  title: string;
  income: number;
  expense: number;
  data: EntryWithCategory[];
}

function groupByDate(entries: EntryWithCategory[]): Section[] {
  const map = new Map<string, Section>();
  for (const entry of entries) {
    const section = map.get(entry.entry_date) ?? { title: entry.entry_date, income: 0, expense: 0, data: [] };
    section.data.push(entry);
    section[entry.type] += entry.amount;
    map.set(entry.entry_date, section);
  }
  return Array.from(map.values());
}

export function HistoryScreen({ navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const categoriesByShop = useCategoryStore((s) => s.categoriesByShop);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const refreshToken = useEntryStore((s) => s.refreshToken);
  const removeEntry = useEntryStore((s) => s.removeEntry);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<EntryWithCategory[]>([]);

  useEffect(() => {
    if (activeShopId) loadCategories(activeShopId);
  }, [activeShopId, loadCategories]);

  const categories = useMemo(() => {
    if (!activeShopId) return [];
    const all = categoriesByShop[activeShopId] ?? [];
    return typeFilter === 'all' ? all : all.filter((c) => c.type === typeFilter);
  }, [categoriesByShop, activeShopId, typeFilter]);

  useEffect(() => {
    setCategoryId(null);
  }, [typeFilter]);

  useEffect(() => {
    if (!activeShopId) return;
    const filters: EntryFilters = {};
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (categoryId) filters.categoryId = categoryId;
    if (search.trim()) filters.search = search.trim();
    listEntries(activeShopId, filters).then(setEntries);
  }, [activeShopId, typeFilter, categoryId, search, refreshToken]);

  const sections = useMemo(() => groupByDate(entries), [entries]);

  const handleDelete = (entry: EntryWithCategory) => {
    Alert.alert('এন্ট্রি মুছবেন?', 'এই এন্ট্রি স্থায়ীভাবে মুছে যাবে', [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'মুছুন',
        style: 'destructive',
        onPress: async () => {
          await removeEntry(entry.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 8 }}>
        <AppText weight="bold" size={22} style={{ marginBottom: 14 }}>
          হিস্ট্রি
        </AppText>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="নোট বা ক্যাটাগরি খুঁজুন"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <ToggleTabs
            options={[
              { key: 'all', label: 'সব' },
              { key: 'income', label: 'আয়' },
              { key: 'expense', label: 'ব্যয়' },
            ]}
            value={typeFilter}
            onChange={(k) => setTypeFilter(k as TypeFilter)}
          />
        </View>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginTop: 12, paddingVertical: 2 }}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                icon={cat.icon}
                active={cat.id === categoryId}
                onPress={() => setCategoryId((prev) => (prev === cat.id ? null : cat.id))}
                activeColor={colors.primary}
                activeBg={colors.incomeBg}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 8, paddingBottom: 40 }}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <AppText weight="semibold" size={13} color={colors.textMuted}>
              {formatDisplayDate(section.title, digitFormat)} · {formatWeekday(section.title)}
            </AppText>
            <AppText weight="semibold" size={12} color={section.income >= section.expense ? colors.income : colors.expense}>
              {formatAmount(section.income - section.expense, digitFormat)}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <View style={styles.swipeActions}>
                <Pressable
                  onPress={() => navigation.navigate('AddEntry', { entryId: item.id })}
                  style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="pencil" size={20} color={colors.onPrimary} />
                </Pressable>
                <Pressable onPress={() => handleDelete(item)} style={[styles.swipeBtn, { backgroundColor: colors.expense }]}>
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          >
            <View style={{ marginBottom: 8 }}>
              <EntryListItem entry={item} onPress={() => navigation.navigate('AddEntry', { entryId: item.id })} />
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
            <AppText color={colors.textMuted} size={13} style={{ marginTop: 10 }}>
              কোনো এন্ট্রি পাওয়া যায়নি
            </AppText>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', height: 46, borderWidth: 1.5, paddingHorizontal: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: fonts.regular, fontSize: 14, height: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  swipeActions: { flexDirection: 'row', marginBottom: 8 },
  swipeBtn: { width: 56, marginLeft: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
