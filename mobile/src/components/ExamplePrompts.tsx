import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

const EXAMPLE_PROMPTS = [
  'Build a todo app in React using Tailwind',
  'Build a simple blog using Astro',
  'Create a cookie consent form using Material UI',
  'Make a space invaders game',
  'How do I center a div?',
];

export function ExamplePrompts() {
  const { theme } = useTheme();
  const { sendMessage } = useChatStore();

  return (
    <View style={{ marginTop: 24, gap: 8, paddingHorizontal: 8 }}>
      {EXAMPLE_PROMPTS.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => void sendMessage(prompt)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: theme.textTertiary, fontSize: 15, textAlign: 'center' }}>{prompt}</Text>
          <Ionicons name="return-down-back" size={14} color={theme.textTertiary} />
        </Pressable>
      ))}
    </View>
  );
}
