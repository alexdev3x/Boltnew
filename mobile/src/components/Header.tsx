import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';
import { BoltWordmark } from './BoltLogo';

function PaneButton({
  active,
  disabled,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: !!disabled }}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: active ? theme.itemBackgroundAccent : 'transparent',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons name={icon} size={16} color={active ? theme.itemContentAccent : theme.textTertiary} />
    </Pressable>
  );
}

export function Header() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { chatStarted, description, activePane, setActivePane, previewHtml, files, setSidebarOpen } = useChatStore();

  const hasProject = files.length > 0 || !!previewHtml;

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
            <PaneButton
              active={activePane === 'chat'}
              icon="chatbubble-ellipses-outline"
              label="Chat"
              onPress={() => setActivePane('chat')}
            />
            <View style={{ width: 1, backgroundColor: theme.borderColor }} />
            <PaneButton
              active={activePane === 'code'}
              disabled={!hasProject}
              icon="code-slash"
              label="Code"
              onPress={() => setActivePane('code')}
            />
            <View style={{ width: 1, backgroundColor: theme.borderColor }} />
            <PaneButton
              active={activePane === 'preview'}
              disabled={!hasProject}
              icon="phone-portrait-outline"
              label="Preview mode"
              onPress={() => setActivePane('preview')}
            />
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}
