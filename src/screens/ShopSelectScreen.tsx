import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { useShopStore } from '@/store/useShopStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getSummary } from '@/db/repositories/entries';
import { todayIso } from '@/utils/dateFormat';
import { formatAmount } from '@/utils/numberFormat';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import type { RootStackParamList } from '@/navigation/types';
import type { Shop } from '@/types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopSelect'>;

function ShopCard({ shop, index, onSelect, onEdit }: { shop: Shop; index: number; onSelect: () => void; onEdit: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    const today = todayIso();
    getSummary(shop.id, today, today).then(setSummary);
  }, [shop.id]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350)}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: colors.incomeBg, borderRadius: radii.md }]}>
          <Ionicons name={(shop.icon as any) || 'storefront'} size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <AppText weight="semibold" size={17}>
            {shop.name}
          </AppText>
          <View style={styles.summaryRow}>
            <AppText size={12} color={colors.income}>
              আয় {formatAmount(summary.income, digitFormat)}
            </AppText>
            <AppText size={12} color={colors.expense} style={{ marginLeft: 10 }}>
              ব্যয় {formatAmount(summary.expense, digitFormat)}
            </AppText>
          </View>
        </View>
        <Pressable hitSlop={10} onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="pencil" size={18} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function ShopSelectScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const shops = useShopStore((s) => s.shops);
  const setActiveShopId = useSettingsStore((s) => s.setActiveShopId);

  const handleSelect = async (shopId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setActiveShopId(shopId);
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <AppText weight="bold" size={22}>
          দোকান বেছে নিন
        </AppText>
      </View>
      <FlatList
        data={shops}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
        renderItem={({ item, index }) => (
          <ShopCard
            shop={item}
            index={index}
            onSelect={() => handleSelect(item.id)}
            onEdit={() => navigation.navigate('ShopForm', { shopId: item.id })}
          />
        )}
      />
      <View style={{ padding: spacing.lg }}>
        <Button label="+ নতুন দোকান যোগ করুন" variant="secondary" onPress={() => navigation.navigate('ShopForm', undefined)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
  },
  cardIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', marginTop: 4 },
  editBtn: { padding: 6 },
});
