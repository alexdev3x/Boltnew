import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';
import { BoltWordmark } from './BoltLogo';

export function Header() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const {
    chatStarted,
    description,
    showChat,
    showWorkbench,
    setSidebarOpen,
    setShowChat,
    setShowWorkbench,
  } = useChatStore();

  const canHideChat = showWorkbench || !showChat;

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.backgroundDepth1,
        borderBottomWidth: chatStarted ? 1 : 0,
        borderBottomColor: theme.borderColor,
      }}
    >
      <View
        style={{
          height: 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => setSidebarOpen(true)}
          hitSlop={12}
          style={{ padding: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Open chat history"
        >
          <Ionicons name="menu-outline" size={24} color={theme.textPrimary} />
        </Pressable>

        <BoltWordmark />

        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            textAlign: 'center',
            color: theme.textPrimary,
            fontSize: 14,
            paddingHorizontal: 8,
          }}
        >
          {chatStarted ? description : ''}
        </Text>

        {chatStarted ? (
          <View
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: theme.borderColor,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Pressable
              disabled={!canHideChat}
              onPress={() => {
                if (canHideChat) setShowChat(!showChat);
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: showChat ? theme.itemBackgroundAccent : 'transparent',
                opacity: !canHideChat ? 0.4 : 1,
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={showChat ? theme.itemContentAccent : theme.textTertiary}
              />
            </Pressable>
            <View style={{ width: 1, backgroundColor: theme.borderColor }} />
            <Pressable
              onPress={() => {
                if (showWorkbench && !showChat) setShowChat(true);
                setShowWorkbench(!showWorkbench);
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: showWorkbench ? theme.itemBackgroundAccent : 'transparent',
              }}
            >
              <Ionicons
                name="code-slash"
                size={16}
                color={showWorkbench ? theme.itemContentAccent : theme.textTertiary}
              />
            </Pressable>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}
