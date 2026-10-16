import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from '@expo-google-fonts/hind-siliguri';
import { initDatabase } from '@/db/schema';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useShopStore } from '@/store/useShopStore';
import { RootNavigator, useAppFlow } from '@/navigation/RootNavigator';
import { SplashScreen } from '@/screens/SplashScreen';
import { useTheme } from '@/theme/useTheme';

function AppShell() {
  const { isDark } = useTheme();
  const flow = useAppFlow();
  return (
    <>
      <NavigationContainer key={flow}>
        <RootNavigator flow={flow} />
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadShops = useShopStore((s) => s.loadShops);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await Promise.all([loadSettings(), loadShops()]);
      setDbReady(true);
    })();
  }, [loadSettings, loadShops]);

  if (!fontsLoaded || !dbReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppShell />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
