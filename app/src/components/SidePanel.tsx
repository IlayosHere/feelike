import React, { useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { useSidePanel } from '@/context/SidePanelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthStore } from '@/stores/authStore';
import type { ThemeMode } from '@/theme/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANEL_MAX_WIDTH = 320;
const DURATION = 220;
const EASING = Easing.bezier(0.2, 0, 0, 1);

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'auto',  label: 'Auto',  icon: '⊙' },
  { value: 'light', label: 'Light', icon: '☀' },
  { value: 'dark',  label: 'Dark',  icon: '☽' },
];

const NAV_ITEMS = [
  { route: '/',         label: 'Journal',  icon: '✏' },
  { route: '/timeline', label: 'Timeline', icon: '☰' },
  { route: '/settings', label: 'Settings', icon: '⚙' },
] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThemeSegment({
  current,
  onChange,
}: {
  current: ThemeMode;
  onChange: (m: ThemeMode) => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.surfaceSunken,
        borderRadius: 10,
        padding: 3,
      }}
    >
      {THEME_OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.label} theme`}
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: active ? theme.accent : 'transparent',
            }}
          >
            <Text style={{ fontSize: 13, color: active ? '#FFFFFF' : theme.textSecondary }}>
              {opt.icon}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: active ? '#FFFFFF' : theme.textSecondary,
              }}
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
// Main component
// ---------------------------------------------------------------------------

export function SidePanel() {
  const { isOpen, close, deleteAction } = useSidePanel();
  const { theme, mode, setMode, resolvedMode } = useTheme();
  const { data: user } = useCurrentUser();
  const clearToken = useAuthStore((s) => s.clearToken);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get('window').width;
  const panelWidth = Math.min(screenWidth * 0.8, PANEL_MAX_WIDTH);

  const translateX = useSharedValue(-panelWidth);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -panelWidth, { duration: DURATION, easing: EASING });
    backdropOpacity.value = withTiming(isOpen ? 1 : 0, { duration: DURATION, easing: EASING });
  }, [isOpen, panelWidth, translateX, backdropOpacity]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  type NavRoute = typeof NAV_ITEMS[number]['route'];
  const handleNav = (route: NavRoute) => {
    close();
    // Small delay lets the panel close animation start before nav
    setTimeout(() => router.push(route), 60);
  };

  const handleSignOut = () => {
    close();
    setTimeout(() => {
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
              router.replace('/(auth)/');
            },
          },
        ],
      );
    }, 60);
  };

  // Derive initials for avatar
  const initials = user?.display_name
    ? user.display_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?';

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
          { backgroundColor: resolvedMode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)' },
          backdropStyle,
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={close}
          accessibilityLabel="Close menu"
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: panelWidth,
            backgroundColor: theme.surface,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            ...(Platform.OS !== 'web' ? theme.shadowLg : {}),
          },
          panelStyle,
        ]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.accentMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.accent }}>
              {initials}
            </Text>
          </View>

          {/* Email */}
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 13,
              color: theme.textSecondary,
            }}
          >
            {user?.email ?? '—'}
          </Text>

          {/* Close button */}
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: 4 }}
          >
            <Text style={{ fontSize: 20, color: theme.textMuted, lineHeight: 24 }}>{'×'}</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: theme.divider, marginHorizontal: 20 }} />

        {/* Nav items */}
        <View style={{ marginTop: 8 }}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => handleNav(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
              })}
            >
              <Text style={{ fontSize: 18, color: theme.textMuted, width: 28 }}>
                {item.icon}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: theme.divider, marginHorizontal: 20, marginTop: 8 }} />

        {/* Appearance */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: theme.textMuted,
              marginBottom: 10,
            }}
          >
            Appearance
          </Text>
          <ThemeSegment current={mode} onChange={setMode} />
        </View>

        {/* Spacer pushes sign-out to bottom */}
        <View style={{ flex: 1 }} />

        {/* Bottom section */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderTopColor: theme.divider,
            paddingTop: 16,
          }}
        >
          {deleteAction ? (
            <Pressable
              onPress={() => { close(); setTimeout(deleteAction, 60); }}
              accessibilityRole="button"
              accessibilityLabel="Delete entry"
              style={{ marginBottom: 16 }}
            >
              <Text style={{ fontSize: 14, color: theme.danger }}>Delete entry</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={{ fontSize: 14, color: theme.textMuted }}>Sign out</Text>
          </Pressable>
          <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>v1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}
