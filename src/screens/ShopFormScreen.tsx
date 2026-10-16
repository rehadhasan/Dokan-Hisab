import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { useShopStore } from '@/store/useShopStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopForm'>;

const ICON_OPTIONS: string[] = [
  'storefront',
  'cart',
  'restaurant',
  'cafe',
  'shirt',
  'basket',
  'fast-food',
  'construct',
  'bicycle',
  'cut',
  'gift',
  'medkit',
];

export function ShopFormScreen({ route, navigation }: Props) {
  const { colors, radii, spacing } = useTheme();
  const shops = useShopStore((s) => s.shops);
  const addShop = useShopStore((s) => s.addShop);
  const editShop = useShopStore((s) => s.editShop);
  const setActiveShopId = useSettingsStore((s) => s.setActiveShopId);

  const shopId = route.params?.shopId;
  const editing = shops.find((s) => s.id === shopId);
  const isFirstTime = shops.length === 0 && !shopId;

  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState(editing?.type ?? '');
  const [icon, setIcon] = useState<string>(editing?.icon ?? ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerShown: !isFirstTime,
      title: editing ? 'দোকান এডিট করুন' : 'নতুন দোকান',
    });
  }, [navigation, isFirstTime, editing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('দোকানের নাম দিন');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await editShop(editing.id, name.trim(), type.trim() || null, icon);
        navigation.goBack();
      } else {
        const shop = await addShop(name.trim(), type.trim() || null, icon);
        await setActiveShopId(shop.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (!isFirstTime) navigation.goBack();
      }
    } catch (e) {
      setError('সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        {isFirstTime && (
          <View style={styles.headerBlock}>
            <View style={[styles.headerIcon, { backgroundColor: colors.incomeBg, borderRadius: radii.xl }]}>
              <Ionicons name="storefront" size={44} color={colors.primary} />
            </View>
            <AppText weight="bold" size={22} style={{ textAlign: 'center', marginBottom: 6 }}>
              আপনার দোকানের নাম দিন
            </AppText>
            <AppText size={14} color={colors.textMuted} style={{ textAlign: 'center' }}>
              পরে আপনি একাধিক দোকান যোগ করতে পারবেন
            </AppText>
          </View>
        )}

        <AppText weight="semibold" size={14} style={styles.label}>
          দোকানের নাম
        </AppText>
        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError('');
          }}
          placeholder="যেমনঃ রহমান স্টোর"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        <AppText weight="semibold" size={14} style={styles.label}>
          দোকানের ধরন (ঐচ্ছিক)
        </AppText>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="যেমনঃ মুদি দোকান, ফার্মেসি"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radii.md },
          ]}
        />

        <AppText weight="semibold" size={14} style={styles.label}>
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
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderRadius: radii.md,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name={opt as any} size={24} color={active ? colors.onPrimary : colors.text} />
              </Pressable>
            );
          })}
        </View>

        {!!error && (
          <AppText color={colors.expense} size={13} style={{ marginTop: 8 }}>
            {error}
          </AppText>
        )}

        <Button label="সংরক্ষণ করুন" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: { alignItems: 'center', marginBottom: 28 },
  headerIcon: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  label: { marginBottom: 8, marginTop: 16 },
  input: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconOption: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
