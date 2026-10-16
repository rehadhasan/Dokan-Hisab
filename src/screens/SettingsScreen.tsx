import { ScrollView, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ToggleTabs } from '@/components/ToggleTabs';
import { SettingsRow } from '@/components/SettingsRow';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Settings'>, NativeStackScreenProps<RootStackParamList>>;

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <AppText weight="semibold" size={13} color={colors.textMuted} style={{ marginBottom: 10, marginTop: 20 }}>
      {children}
    </AppText>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { spacing } = useTheme();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const setDigitFormat = useSettingsStore((s) => s.setDigitFormat);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <AppText weight="bold" size={22}>
          সেটিংস
        </AppText>

        <SectionLabel>প্রদর্শন</SectionLabel>
        <View style={{ marginBottom: 4 }}>
          <AppText size={13} style={{ marginBottom: 8 }}>
            থিম
          </AppText>
          <ToggleTabs
            options={[
              { key: 'light', label: 'লাইট' },
              { key: 'dark', label: 'ডার্ক' },
            ]}
            value={theme}
            onChange={(k) => setTheme(k as 'light' | 'dark')}
          />
        </View>
        <View style={{ marginTop: 16 }}>
          <AppText size={13} style={{ marginBottom: 8 }}>
            সংখ্যা ফরম্যাট
          </AppText>
          <ToggleTabs
            options={[
              { key: 'bn', label: 'বাংলা (০১২)' },
              { key: 'en', label: 'English (012)' },
            ]}
            value={digitFormat}
            onChange={(k) => setDigitFormat(k as 'bn' | 'en')}
          />
        </View>

        <SectionLabel>দোকান</SectionLabel>
        <SettingsRow icon="storefront-outline" label="দোকান ম্যানেজমেন্ট" onPress={() => navigation.navigate('ShopSelect')} />
        <SettingsRow icon="pricetags-outline" label="ক্যাটাগরি ম্যানেজমেন্ট" onPress={() => navigation.navigate('CategoryManagement')} />

        <SectionLabel>ডেটা</SectionLabel>
        <SettingsRow icon="cloud-upload-outline" label="ব্যাকআপ ও এক্সপোর্ট" onPress={() => navigation.navigate('BackupExport')} />

        <SectionLabel>সাপোর্ট</SectionLabel>
        <SettingsRow icon="heart-outline" label="ডেভেলপারকে সাপোর্ট করুন" onPress={() => navigation.navigate('Donate')} />

        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <AppText size={13} color="#888">
            দোকান হিসাব · v1.0.0
          </AppText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
