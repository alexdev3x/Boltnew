import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type SliderProps = {
  selected: 'code' | 'preview';
  onSelect: (value: 'code' | 'preview') => void;
};

export function Slider({ selected, onSelect }: SliderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.backgroundDepth1,
        borderRadius: 999,
        padding: 4,
        gap: 4,
      }}
    >
      {(
        [
          { value: 'code', label: 'Code' },
          { value: 'preview', label: 'Preview' },
        ] as const
      ).map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active ? theme.itemBackgroundAccent : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: active ? theme.itemContentAccent : theme.textTertiary,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
