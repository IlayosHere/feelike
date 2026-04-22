import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '@/hooks/useLogin';
import { useSignup } from '@/hooks/useSignup';
import { SignInForm, SignUpForm } from './AuthForms';

type Tab = 'signin' | 'signup';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [showSignInSuccess, setShowSignInSuccess] = useState(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);

  const login = useLogin();
  const signup = useSignup();

  // When mutation succeeds, briefly show checkmark before the auth guard
  // redirects. The redirect is triggered automatically by authStore.setToken().
  useEffect(() => {
    if (login.isSuccess) {
      setShowSignInSuccess(true);
    }
  }, [login.isSuccess]);

  useEffect(() => {
    if (signup.isSuccess) {
      setShowSignUpSuccess(true);
    }
  }, [signup.isSuccess]);

  const handleTabChange = useCallback((tab: Tab) => {
    Keyboard.dismiss();
    setActiveTab(tab);
    // Reset mutation state when switching tabs
    login.reset();
    signup.reset();
    setShowSignInSuccess(false);
    setShowSignUpSuccess(false);
  }, [login, signup]);

  const tabClass = (tab: Tab) =>
    tab === activeTab
      ? 'flex-1 items-center pb-2 border-b-2 border-accent'
      : 'flex-1 items-center pb-2 border-b-2 border-transparent';

  const tabTextClass = (tab: Tab) =>
    tab === activeTab
      ? 'text-accent font-semibold text-base'
      : 'text-text-secondary text-base';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand space */}
          <View className="items-center justify-center px-4 py-10">
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-2xl bg-accent items-center justify-center mb-4 shadow-md"
                style={{ shadowColor: '#FF5D73', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}
              >
                <Text style={{ fontSize: 38, lineHeight: 44 }}>{'🫀'}</Text>
              </View>
              <Text
                className="text-text-primary text-5xl font-bold tracking-tight mb-1"
                accessibilityRole="header"
              >
                feelike
              </Text>
              <Text className="text-text-secondary text-base">
                Your thoughts, privately.
              </Text>
            </View>
          </View>

          {/* Auth card */}
          <View className="bg-surface rounded-xl mx-4 p-6 shadow-md mb-8">
            {/* Tab row */}
            <View className="flex-row mb-6">
              <Pressable
                className={tabClass('signin')}
                onPress={() => handleTabChange('signin')}
                accessibilityRole="tab"
                accessibilityLabel="Sign In"
                accessibilityState={{ selected: activeTab === 'signin' }}
              >
                <Text className={tabTextClass('signin')}>Sign In</Text>
              </Pressable>
              <Pressable
                className={tabClass('signup')}
                onPress={() => handleTabChange('signup')}
                accessibilityRole="tab"
                accessibilityLabel="Sign Up"
                accessibilityState={{ selected: activeTab === 'signup' }}
              >
                <Text className={tabTextClass('signup')}>Sign Up</Text>
              </Pressable>
            </View>

            {/* Forms */}
            {activeTab === 'signin' ? (
              <SignInForm
                onSuccess={() => {}}
                mutate={login.mutate}
                isLoading={login.isPending}
                isSuccess={showSignInSuccess}
                serverError={
                  login.isError
                    ? extractErrorMessage(login.error)
                    : undefined
                }
              />
            ) : (
              <SignUpForm
                onSuccess={() => {}}
                mutate={signup.mutate}
                isLoading={signup.isPending}
                isSuccess={showSignUpSuccess}
                serverError={
                  signup.isError
                    ? extractErrorMessage(signup.error)
                    : undefined
                }
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
