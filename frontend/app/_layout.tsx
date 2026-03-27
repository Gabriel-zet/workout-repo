import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

// 1. Importe os hooks de fonte do Expo
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import RootLayoutNav from '@/components/navigation/RootLayoutNav';

// Impede que a tela de abertura (Splash) suma antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 2. Carregando as fontes aqui
  const [loaded, error] = useFonts({
    'TT-Firs-Black': require('../assets/fonts/TT-Firs-Black.ttf'), // Font Black
    'TT-Firs-Regular': require('../assets/fonts/TT-Firs-Regular.ttf'), // Font Regular
    'TT-Firs-DemiBold': require('../assets/fonts/TT-Firs-DemiBold.ttf'), // Font DemiBold
    'TT-Firs-Bold': require('../assets/fonts/TT-Firs-Bold.ttf'), // Font Bold
    'TT-Firs-Medium': require('../assets/fonts/TT-Firs-Medium.ttf'), // Font Medium
  });

  // 3. Esconde o Splash Screen quando terminar de carregar
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Enquanto não carrega, não renderiza nada (ou uma View vazia)
  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
