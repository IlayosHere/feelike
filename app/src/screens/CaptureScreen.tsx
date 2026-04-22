import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { MoodRow } from '@/components/capture/MoodRow';
import { TagSection } from '@/components/capture/TagSection';
import { useCaptureStore } from '@/stores/captureStore';
import { useCreateEntry } from '@/hooks/useCreateEntry';

const PROMPTS = [
  "What's on your mind?",
  'How are you feeling?',
  'Got an idea?',
];

function pickRandomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

type ToastState = {
  visible: boolean;
  message: string;
  type: 'error' | 'success';
};

const HIDDEN_TOAST: ToastState = { visible: false, message: '', type: 'error' };
const SUCCESS_FLASH_MS = 400;

export function CaptureScreen() {
  const router = useRouter();
  const { content, mood, tags, setContent, reset } = useCaptureStore();
  const createEntry = useCreateEntry();

  const [toast, setToast] = useState<ToastState>(HIDDEN_TOAST);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const placeholderRef = useRef(pickRandomPrompt());

  const canSave = content.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;

    createEntry.mutate(
      {
        content,
        mood: mood ?? undefined,
        tags,
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setToast(HIDDEN_TOAST);
          setTimeout(() => {
            setSaveSuccess(false);
            reset();
          }, SUCCESS_FLASH_MS);
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : 'Could not save. Try again.';
          setToast({ visible: true, message, type: 'error' });
        },
      },
    );
  }, [canSave, content, mood, tags, createEntry, reset]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-bg">
        <Header onTimelinePress={() => router.push('/timeline')} />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <CaptureInput
            value={content}
            onChange={setContent}
            placeholder={placeholderRef.current}
          />
          <MoodRow />
          <TagSection />
        </ScrollView>

        <SaveBar
          onSave={handleSave}
          loading={createEntry.isPending}
          success={saveSuccess}
          disabled={!canSave}
          toast={toast}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// --- Sub-components ---

type HeaderProps = { onTimelinePress: () => void };

function Header({ onTimelinePress }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
      <Text className="text-title text-text-primary font-sans-bold">
        feelike
      </Text>
      <Pressable
        onPress={onTimelinePress}
        accessibilityRole="button"
        accessibilityLabel="Open timeline"
        className="p-2"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-text-secondary text-xl">{'☰'}</Text>
      </Pressable>
    </View>
  );
}

type CaptureInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
};

function CaptureInput({ value, onChange, placeholder }: CaptureInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9B9BAD"
      multiline
      autoFocus
      textAlignVertical="top"
      className="bg-surface-sunken rounded-xl p-4 text-text-primary text-body mx-4 min-h-[160px]"
      accessibilityLabel="Journal entry"
    />
  );
}

type SaveBarProps = {
  onSave: () => void;
  loading: boolean;
  success: boolean;
  disabled: boolean;
  toast: ToastState;
};

function SaveBar({ onSave, loading, success, disabled, toast }: SaveBarProps) {
  return (
    <View className="bg-surface border-t border-border">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />
      <View className="px-4 py-3">
        <Button
          label="Save"
          onPress={onSave}
          loading={loading}
          success={success}
          disabled={disabled}
        />
      </View>
    </View>
  );
}
