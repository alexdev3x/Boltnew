import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

export function Workbench() {
  const { theme } = useTheme();
  const { files, selectedFile, setSelectedFile, updateFileContent, setActivePane } = useChatStore();

  const currentFile = useMemo(
    () => files.find((file) => file.path === selectedFile) ?? files[0],
    [files, selectedFile],
  );

  return (
    <View
      style={{
        flex: 1,
        margin: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 12,
        backgroundColor: theme.backgroundDepth2,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          gap: 8,
        }}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}>Code</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => setActivePane('preview')}
          hitSlop={10}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: theme.itemBackgroundAccent,
          }}
        >
          <Ionicons name="phone-portrait-outline" size={14} color={theme.itemContentAccent} />
          <Text style={{ color: theme.itemContentAccent, fontSize: 12, fontWeight: '600' }}>Preview</Text>
        </Pressable>
        <Pressable onPress={() => setActivePane('chat')} hitSlop={10}>
          <Ionicons name="close-circle-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <ScrollView
          style={{
            width: 128,
            borderRightWidth: 1,
            borderRightColor: theme.borderColor,
            backgroundColor: theme.backgroundDepth1,
          }}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {files.map((file) => {
            const active = file.path === currentFile?.path;
            return (
              <Pressable
                key={file.path}
                onPress={() => setSelectedFile(file.path)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  backgroundColor: active ? theme.itemBackgroundActive : 'transparent',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: active ? theme.textPrimary : theme.textSecondary,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  {file.path.replace(/^\//, '')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderColor,
              backgroundColor: theme.backgroundDepth1,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'monospace' }}>
              {currentFile?.path ?? 'No file selected'}
            </Text>
          </View>
          <TextInput
            multiline
            value={currentFile?.content ?? ''}
            onChangeText={(value) => {
              if (currentFile) updateFileContent(currentFile.path, value);
            }}
            style={{
              flex: 1,
              padding: 12,
              color: theme.codeText,
              backgroundColor: theme.codeBackground,
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 18,
              textAlignVertical: 'top',
            }}
          />
        </View>
      </View>
    </View>
  );
}
