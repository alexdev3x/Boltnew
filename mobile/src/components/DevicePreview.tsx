import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme/ThemeContext';

const PREVIEW_BASE_URL = 'https://preview.bolt.mobile/app';

function PreviewFrame({
  html,
  backgroundColor,
  reloadKey,
}: {
  html: string;
  backgroundColor: string;
  reloadKey: number;
}) {
  if (Platform.OS === 'web') {
    const IFrame = 'iframe' as unknown as React.ElementType;
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <IFrame
          key={reloadKey}
          title="Bolt device preview"
          srcDoc={html}
          style={{ border: 'none', width: '100%', height: '100%', backgroundColor }}
        />
      </View>
    );
  }

  return (
    <WebView
      key={reloadKey}
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1, backgroundColor }}
    />
  );
}

export function DevicePreview() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { previewHtml, setActivePane, description } = useChatStore();
  const [url, setUrl] = useState(PREVIEW_BASE_URL);
  const [committedUrl, setCommittedUrl] = useState(PREVIEW_BASE_URL);
  const [reloadKey, setReloadKey] = useState(0);

  const canNavigate = useMemo(() => {
    if (url === PREVIEW_BASE_URL) return true;
    if (!url.startsWith(PREVIEW_BASE_URL)) return false;
    return ['/', '?', '#'].includes(url.charAt(PREVIEW_BASE_URL.length));
  }, [url]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundDepth1, paddingBottom: Math.max(insets.bottom, 12) }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: theme.backgroundDepth2,
        }}
      >
        <Pressable
          onPress={() => setReloadKey((value) => value + 1)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Reload preview"
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.itemBackgroundActive,
          }}
        >
          <Ionicons name="refresh" size={18} color={theme.textPrimary} />
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.previewAddressBar,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <TextInput
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => {
              if (!canNavigate) return;
              setCommittedUrl(url);
              setReloadKey((value) => value + 1);
            }}
            style={{
              flex: 1,
              color: theme.textPrimary,
              fontSize: 13,
              padding: 0,
            }}
          />
        </View>

        <Pressable
          onPress={() => setActivePane('code')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close preview mode"
        >
          <Ionicons name="close-circle-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }}>
        <Text style={{ color: theme.textTertiary, fontSize: 12, textAlign: 'center' }}>
          Device Preview{description ? ` · ${description}` : ''}
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingTop: 8 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            flex: 1,
            maxHeight: 720,
            borderRadius: 36,
            borderWidth: 10,
            borderColor: '#1f1f1f',
            backgroundColor: '#000',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: 28,
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 6,
              backgroundColor: '#0A0A0A',
            }}
          >
            <View
              style={{
                width: 96,
                height: 10,
                borderRadius: 999,
                backgroundColor: '#171717',
              }}
            />
          </View>

          <View style={{ flex: 1, backgroundColor: theme.backgroundDepth1 }}>
            {previewHtml ? (
              <PreviewFrame
                html={previewHtml}
                backgroundColor={theme.backgroundDepth1}
                reloadKey={reloadKey}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Ionicons name="phone-portrait-outline" size={36} color={theme.textTertiary} />
                <Text style={{ color: theme.textTertiary, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
                  No preview available yet. Ask Bolt to scaffold an app, then open Preview mode.
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              height: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0A0A0A',
            }}
          >
            <View
              style={{
                width: 108,
                height: 4,
                borderRadius: 999,
                backgroundColor: '#262626',
              }}
            />
          </View>
        </View>

        <Text style={{ color: theme.textTertiary, fontSize: 11, marginTop: 10 }} numberOfLines={1}>
          {committedUrl}
        </Text>
      </View>
    </View>
  );
}
