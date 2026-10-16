import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { HomeScreen } from '@/screens/HomeScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { GraphScreen } from '@/screens/GraphScreen';
import { CreditScreen } from '@/screens/CreditScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  History: 'time',
  Graph: 'bar-chart',
  Credit: 'wallet',
  Settings: 'settings',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Home: 'হোম',
  History: 'হিস্ট্রি',
  Graph: 'গ্রাফ',
  Credit: 'বাকি-দেনা',
  Settings: 'সেটিংস',
};

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} size={focused ? size + 2 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: LABELS.Home }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: LABELS.History }} />
      <Tab.Screen name="Graph" component={GraphScreen} options={{ tabBarLabel: LABELS.Graph }} />
      <Tab.Screen name="Credit" component={CreditScreen} options={{ tabBarLabel: LABELS.Credit }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: LABELS.Settings }} />
    </Tab.Navigator>
  );
}
