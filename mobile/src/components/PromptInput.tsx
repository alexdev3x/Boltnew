import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

export function PromptInput() {
  const { theme } = useTheme();
  const {
    input,
    setInput,
    sendMessage,
    stopStreaming,
    isStreaming,
    chatStarted,
    enhancePrompt,
    enhancingPrompt,
    promptEnhanced,
  } = useChatStore();

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.borderColor,
          backgroundColor: theme.promptBackground,
          borderRadius: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <View style={{ position: 'relative' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="How can Bolt help you today?"
            placeholderTextColor={theme.textTertiary}
            multiline
            style={{
              minHeight: chatStarted ? 76 : 90,
              maxHeight: chatStarted ? 160 : 200,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 16,
              paddingRight: 56,
              color: theme.textPrimary,
              fontSize: 16,
              lineHeight: 22,
              textAlignVertical: 'top',
            }}
          />
          {(input.length > 0 || isStreaming) && (
            <Pressable
              onPress={() => {
                if (isStreaming) {
                  stopStreaming();
                  return;
                }
                void sendMessage();
              }}
              style={{
                position: 'absolute',
                right: 12,
                top: 12,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={isStreaming ? 'stop' : 'arrow-up'} size={18} color="#fff" />
            </Pressable>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingBottom: 12,
            gap: 8,
          }}
        >
          <Pressable
            disabled={input.length === 0 || enhancingPrompt}
            onPress={() => void enhancePrompt()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: input.length === 0 ? 0.4 : 1,
              backgroundColor: promptEnhanced ? theme.itemBackgroundAccent : 'transparent',
              paddingHorizontal: promptEnhanced ? 8 : 4,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            {enhancingPrompt ? (
              <>
                <ActivityIndicator size="small" color={theme.loaderProgress} />
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Enhancing prompt...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={promptEnhanced ? theme.itemContentAccent : theme.textSecondary}
                />
                {promptEnhanced && (
                  <Text style={{ color: theme.itemContentAccent, fontSize: 13 }}>Prompt enhanced</Text>
                )}
              </>
            )}
          </Pressable>

          {input.length > 3 ? (
            <Text style={{ color: theme.textTertiary, fontSize: 11 }}>Return to send · new line in editor</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
