import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';
import { Slider } from './Slider';

export function Workbench() {
  const { theme } = useTheme();
  const {
    showWorkbench,
    chatStarted,
    selectedView,
    setSelectedView,
    files,
    selectedFile,
    setSelectedFile,
    previewHtml,
    updateFileContent,
    setShowWorkbench,
    setShowChat,
  } = useChatStore();

  const currentFile = useMemo(
    () => files.find((file) => file.path === selectedFile) ?? files[0],
    [files, selectedFile],
  );

  if (!chatStarted || !showWorkbench) {
    return null;
  }

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
        <Slider selected={selectedView} onSelect={setSelectedView} />
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => {
            setShowWorkbench(false);
            setShowChat(true);
          }}
          hitSlop={10}
        >
          <Ionicons name="close-circle-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      {selectedView === 'code' ? (
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
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              margin: 10,
              borderRadius: 8,
              backgroundColor: theme.previewAddressBar,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={1}>
              https://preview.bolt.mobile/app
            </Text>
          </View>
          {previewHtml ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: previewHtml }}
              style={{ flex: 1, backgroundColor: theme.backgroundDepth1 }}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.textTertiary }}>Preview will appear once Bolt finishes scaffolding.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
