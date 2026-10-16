import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useShopStore } from '@/store/useShopStore';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ShopFormScreen } from '@/screens/ShopFormScreen';
import { ShopSelectScreen } from '@/screens/ShopSelectScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { CategoryManagementScreen } from '@/screens/CategoryManagementScreen';
import { CreditFormScreen } from '@/screens/CreditFormScreen';
import { CreditDetailScreen } from '@/screens/CreditDetailScreen';
import { BackupExportScreen } from '@/screens/BackupExportScreen';
import { DonateScreen } from '@/screens/DonateScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type AppFlow = 'onboarding' | 'shopform' | 'shopselect' | 'main';

export function useAppFlow(): AppFlow {
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const shops = useShopStore((s) => s.shops);

  const hasValidActiveShop = !!activeShopId && shops.some((s) => s.id === activeShopId);

  if (!onboardingSeen) return 'onboarding';
  if (shops.length === 0) return 'shopform';
  if (!hasValidActiveShop) return 'shopselect';
  return 'main';
}

export function RootNavigator({ flow }: { flow: AppFlow }) {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {flow === 'onboarding' && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
      {flow === 'shopform' && <Stack.Screen name="ShopForm" component={ShopFormScreen} />}
      {flow === 'shopselect' && <Stack.Screen name="ShopSelect" component={ShopSelectScreen} />}
      {flow === 'main' && (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ShopSelect" component={ShopSelectScreen} options={{ headerShown: true, title: 'দোকান বেছে নিন' }} />
          <Stack.Screen name="ShopForm" component={ShopFormScreen} />
          <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} options={{ headerShown: true, title: 'ক্যাটাগরি' }} />
          <Stack.Screen name="CreditDetail" component={CreditDetailScreen} options={{ headerShown: true, title: 'বিস্তারিত' }} />
          <Stack.Screen name="BackupExport" component={BackupExportScreen} options={{ headerShown: true, title: 'ব্যাকআপ ও এক্সপোর্ট' }} />
          <Stack.Screen name="Donate" component={DonateScreen} options={{ headerShown: true, title: 'সাপোর্ট করুন' }} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="AddEntry" component={AddEntryScreen} />
            <Stack.Screen name="CreditForm" component={CreditFormScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
