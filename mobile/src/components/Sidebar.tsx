import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';
import { binDates } from '../utils/dateBinning';

export function Sidebar() {
  const insets = useSafeAreaInsets();
  const { theme, themeName, toggleTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen, chats, startNewChat, loadChat, deleteChat, activeChatId } = useChatStore();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDelete = chats.find((chat) => chat.id === pendingDeleteId) ?? null;

  return (
    <>
      <Modal visible={sidebarOpen} animationType="fade" transparent onRequestClose={() => setSidebarOpen(false)}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              width: '86%',
              maxWidth: 360,
              backgroundColor: theme.backgroundDepth2,
              paddingTop: insets.top,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              borderRightWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <View style={{ height: 56 }} />
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <Pressable
                onPress={startNewChat}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: theme.sidebarButtonBackground,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.sidebarButtonText} />
                <Text style={{ color: theme.sidebarButtonText, fontWeight: '600' }}>Start new chat</Text>
              </Pressable>
            </View>

            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: '600',
                paddingHorizontal: 24,
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              Your Chats
            </Text>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              {chats.length === 0 ? (
                <Text style={{ color: theme.textTertiary, paddingHorizontal: 8 }}>No previous conversations</Text>
              ) : (
                binDates(chats).map(({ category, items }) => (
                  <View key={category} style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.textTertiary, marginBottom: 8, paddingHorizontal: 8 }}>{category}</Text>
                    {items.map((item) => {
                      const active = item.id === activeChatId;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => loadChat(item.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: active ? theme.itemBackgroundActive : 'transparent',
                          }}
                        >
                          <Text style={{ flex: 1, color: theme.textPrimary }} numberOfLines={1}>
                            {item.description}
                          </Text>
                          <Pressable onPress={() => setPendingDeleteId(item.id)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.borderColor,
                padding: 16,
                paddingBottom: Math.max(insets.bottom, 16),
                alignItems: 'flex-end',
              }}
            >
              <Pressable
                onPress={toggleTheme}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: theme.itemBackgroundActive,
                }}
              >
                <Ionicons
                  name={themeName === 'dark' ? 'sunny-outline' : 'moon-outline'}
                  size={18}
                  color={theme.textPrimary}
                />
                <Text style={{ color: theme.textPrimary }}>{themeName === 'dark' ? 'Light' : 'Dark'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setSidebarOpen(false)} />
        </View>
      </Modal>

      <Modal visible={pendingDelete !== null} transparent animationType="fade" onRequestClose={() => setPendingDeleteId(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              backgroundColor: theme.backgroundDepth2,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.borderColor,
              overflow: 'hidden',
            }}
          >
            <View style={{ padding: 20 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                Delete Chat?
              </Text>
              <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
                You are about to delete <Text style={{ fontWeight: '700' }}>{pendingDelete?.description}</Text>.
              </Text>
              <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Are you sure you want to delete this chat?</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 8,
                padding: 16,
                backgroundColor: theme.backgroundDepth1,
              }}
            >
              <Pressable
                onPress={() => setPendingDeleteId(null)}
                style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.itemBackgroundActive }}
              >
                <Text style={{ color: theme.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingDelete) deleteChat(pendingDelete.id);
                  setPendingDeleteId(null);
                }}
                style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.15)' }}
              >
                <Text style={{ color: '#EF4444', fontWeight: '600' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
