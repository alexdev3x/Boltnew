import React from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { DevicePreview } from '../components/DevicePreview';
import { ExamplePrompts } from '../components/ExamplePrompts';
import { Header } from '../components/Header';
import { Messages } from '../components/Messages';
import { PromptInput } from '../components/PromptInput';
import { Sidebar } from '../components/Sidebar';
import { Workbench } from '../components/Workbench';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

export function HomeScreen() {
  const { theme } = useTheme();
  const { chatStarted, activePane } = useChatStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundDepth1 }}>
      <Header />
      <Sidebar />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          {activePane === 'chat' && (
            <View style={{ flex: 1 }}>
              {!chatStarted ? (
                <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
                  <View style={{ marginTop: -40 }}>
                    <Text
                      style={{
                        color: theme.textPrimary,
                        fontSize: 36,
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: 8,
                      }}
                    >
                      Where ideas begin
                    </Text>
                    <Text
                      style={{
                        color: theme.textSecondary,
                        textAlign: 'center',
                        marginBottom: 20,
                        fontSize: 15,
                        lineHeight: 22,
                      }}
                    >
                      Bring ideas to life in seconds or get help on existing projects.
                    </Text>
                    <PromptInput />
                    <ExamplePrompts />
                  </View>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Messages />
                  <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                    <PromptInput />
                  </View>
                </View>
              )}
            </View>
          )}

          {activePane === 'code' && chatStarted && (
            <View style={{ flex: 1 }}>
              <Workbench />
            </View>
          )}

          {activePane === 'preview' && chatStarted && (
            <View style={{ flex: 1 }}>
              <DevicePreview />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
