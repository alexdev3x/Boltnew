import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatStoreProvider } from './src/store/chatStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppShell() {
  const { themeName } = useTheme();

  return (
    <>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <HomeScreen />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ChatStoreProvider>
            <AppShell />
          </ChatStoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
