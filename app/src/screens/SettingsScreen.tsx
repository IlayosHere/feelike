import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthStore } from '@/stores/authStore';
import { useSidePanel } from '@/context/SidePanelContext';
import type { ThemeMode } from '@/theme/types';

// ---------------------------------------------------------------------------
// Theme segmented control
// ---------------------------------------------------------------------------

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type ThemeSegmentProps = {
  current: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

function ThemeSegment({ current, onChange }: ThemeSegmentProps) {
  return (
    <View className="flex-row bg-surface-sunken rounded-lg p-0.5">
      {THEME_OPTIONS.map((opt) => {
        const isActive = current === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.label} theme`}
            accessibilityState={{ selected: isActive }}
            className={`px-3 py-1.5 rounded-md ${
              isActive ? 'bg-accent' : ''
            }`}
          >
            <Text
              className={`text-caption font-sans-medium ${
                isActive ? 'text-text-on-accent' : 'text-text-secondary'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Reusable row primitives
// ---------------------------------------------------------------------------

type RowProps = {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

function Row({ children, onPress, accessibilityLabel }: RowProps) {
  const inner = (
    <View className="flex-row items-center justify-between px-4 py-3.5 bg-surface border-b border-border">
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="active:opacity-70"
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-text-secondary text-caption uppercase tracking-widest px-4 pt-5 pb-1.5">
      {label}
    </Text>
  );
}

function ChevronRight() {
  return (
    <Text className="text-text-muted text-body" accessibilityElementsHidden>
      {'›'}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const { data: user } = useCurrentUser();
  const clearToken = useAuthStore((s) => s.clearToken);

  const handleSignOut = () => {
    Alert.alert(
      "Sign out?",
      "You'll need to sign in again.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            void clearToken();
            router.replace('/(auth)/index' as any);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <SettingsHeader onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Account */}
        <SectionHeader label="Account" />
        <View className="rounded-xl overflow-hidden mx-4">
          <Row>
            <Text className="text-text-primary text-body" numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </Row>

          <Row
            accessibilityLabel="Change password"
          >
            <Text className="text-text-secondary text-body">
              Change password
            </Text>
            <ChevronRight />
          </Row>

          <Row
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
          >
            <Text className="text-danger text-body">Sign out</Text>
          </Row>
        </View>

        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <View className="rounded-xl overflow-hidden mx-4">
          <Row>
            <Text className="text-text-primary text-body">Theme</Text>
            <ThemeSegment current={mode} onChange={setMode} />
          </Row>
        </View>

        {/* About */}
        <SectionHeader label="About" />
        <View className="rounded-xl overflow-hidden mx-4">
          <Row>
            <Text className="text-text-secondary text-body">Version</Text>
            <Text className="text-text-muted text-body">1.0.0</Text>
          </Row>

          <Row>
            <Text className="text-text-secondary text-body">
              Privacy Policy
            </Text>
            <ChevronRight />
          </Row>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SettingsHeader({ onBack }: { onBack: () => void }) {
  const { open: openPanel } = useSidePanel();
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
      <View className="flex-row items-center">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="p-2 mr-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-text-secondary text-xl">{'←'}</Text>
        </Pressable>
        <Text className="text-title text-text-primary font-sans-bold">
          Settings
        </Text>
      </View>
      <Pressable
        onPress={openPanel}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        className="p-2"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-text-secondary text-xl">{'≡'}</Text>
      </Pressable>
    </View>
  );
}
