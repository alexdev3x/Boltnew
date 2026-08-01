import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

function renderInlineMarkdown(content: string, color: string, accent: string) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text key={`${index}-${line}`} style={{ color, fontSize: 15, lineHeight: 22, marginBottom: 4 }}>
        {boldParts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={partIndex} style={{ fontWeight: '700', color: accent }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          if (part.startsWith('- ')) {
            return <Text key={partIndex}>{`• ${part.slice(2)}`}</Text>;
          }
          return <Text key={partIndex}>{part}</Text>;
        })}
      </Text>
    );
  });
}

export function Messages() {
  const { theme } = useTheme();
  const { messages, isStreaming } = useChatStore();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isStreaming]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}
    >
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isLast = index === messages.length - 1;
        return (
          <View
            key={message.id}
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 16,
              borderRadius: 12,
              backgroundColor:
                isUser || !isStreaming || (isStreaming && !isLast) ? theme.messagesBackground : 'transparent',
              marginTop: index === 0 ? 0 : 12,
            }}
          >
            {isUser && (
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person" size={18} color="#525252" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              {renderInlineMarkdown(message.content, theme.textPrimary, theme.accent)}
            </View>
          </View>
        );
      })}
      {isStreaming && (
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <ActivityIndicator color={theme.loaderProgress} />
        </View>
      )}
    </ScrollView>
  );
}
