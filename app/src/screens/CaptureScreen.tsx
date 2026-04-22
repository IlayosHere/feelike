import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Toast } from '@/components/ui/Toast';
import { MoodRow } from '@/components/capture/MoodRow';
import { TagSection } from '@/components/capture/TagSection';
import { useCaptureStore } from '@/stores/captureStore';
import { useCreateEntry } from '@/hooks/useCreateEntry';
import { useTheme } from '@/theme/useTheme';
import { GradientText } from '@/components/ui/GradientText';

const PROMPTS = ["What's on your mind?", 'How are you feeling?', 'Got an idea?'];

function pickRandomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

type ToastState = { visible: boolean; message: string; type: 'error' | 'success' };
const HIDDEN_TOAST: ToastState = { visible: false, message: '', type: 'error' };
const SUCCESS_FLASH_MS = 400;

export function CaptureScreen() {
  const router = useRouter();
  const { content, mood, tags, setContent, reset } = useCaptureStore();
  const createEntry = useCreateEntry();
  const { theme } = useTheme();

  const [toast, setToast] = useState<ToastState>(HIDDEN_TOAST);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const placeholderRef = useRef(pickRandomPrompt());

  const canSave = content.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    createEntry.mutate(
      { content, mood: mood ?? undefined, tags },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setToast(HIDDEN_TOAST);
          setTimeout(() => { setSaveSuccess(false); reset(); }, SUCCESS_FLASH_MS);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : 'Could not save. Try again.';
          setToast({ visible: true, message, type: 'error' });
        },
      },
    );
  }, [canSave, content, mood, tags, createEntry, reset]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, ...(Platform.OS === 'web' ? { height: '100%' as any } : {}) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <GradientText
          from={theme.gradBrandStart}
          to={theme.gradBrandEnd}
          style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}
        >
          feelike
        </GradientText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => router.push('/timeline')}
            accessibilityRole="button"
            accessibilityLabel="Open timeline"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18, color: theme.textPrimary }}>{'☰'}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18, color: theme.textPrimary }}>{'⚙'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Textarea — flex:1 fills all space between header and bottom bar */}
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={placeholderRef.current}
        placeholderTextColor={theme.textSecondary}
        multiline
        autoFocus={Platform.OS !== 'web'}
        textAlignVertical="top"
        style={{
          flex: 1,
          marginHorizontal: 24,
          marginTop: 16,
          padding: 22,
          backgroundColor: theme.surface,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: theme.borderStrong,
          fontSize: 17,
          lineHeight: 26,
          color: theme.textPrimary,
          fontWeight: '500',
        }}
        accessibilityLabel="Journal entry"
      />

      {/* Mood row */}
      <MoodRow />

      {/* Tag section */}
      <TagSection />

      {/* Save bar — always at bottom */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 }}>
        <Toast message={toast.message} type={toast.type} visible={toast.visible} />
        <Pressable
          onPress={handleSave}
          disabled={!canSave || createEntry.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save entry"
          accessibilityState={{ disabled: !canSave }}
          style={{ opacity: (!canSave || createEntry.isPending) ? 0.45 : 1, borderRadius: 20, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={[theme.gradPrimaryStart, theme.gradPrimaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              {saveSuccess ? '✓ Saved' : 'Save entry'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
