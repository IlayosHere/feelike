import React from 'react';
import { Platform, Text } from 'react-native';

type Props = {
  children: string;
  from: string;
  to: string;
  style?: object;
};

export function GradientText({ children, from, to, style }: Props) {
  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          style,
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore — web-only CSS properties not in RN types
            background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          },
        ]}
      >
        {children}
      </Text>
    );
  }

  // Native fallback: use the start color
  return <Text style={[style, { color: from }]}>{children}</Text>;
}
