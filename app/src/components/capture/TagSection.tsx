import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTags } from '@/hooks/useTags';
import { useCaptureStore } from '@/stores/captureStore';
import { useTheme } from '@/theme/useTheme';

const AUTOSUGGEST_MIN_LENGTH = 1;
const MAX_SUGGESTIONS = 4;

export function TagSection() {
  const { tagInput, tags, setTagInput, addTag, removeTag } = useCaptureStore();
  const { data: allTags } = useTags();
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const suggestions =
    tagInput.length >= AUTOSUGGEST_MIN_LENGTH && allTags
      ? allTags
          .map((t) => t.name)
          .filter((name) => name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(name))
          .slice(0, MAX_SUGGESTIONS)
      : [];

  const handleSubmit = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput('');
      setDropdownVisible(false);
    }
    setInputVisible(false);
  };

  const handleSuggestionPress = (name: string) => {
    addTag(name);
    setTagInput('');
    setDropdownVisible(false);
    setInputVisible(false);
  };

  const handleChangeText = (text: string) => {
    setTagInput(text);
    setDropdownVisible(text.length >= AUTOSUGGEST_MIN_LENGTH);
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {/* Existing tags */}
        {tags.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => removeTag(tag)}
            accessibilityRole="button"
            accessibilityLabel={`Remove tag ${tag}`}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 100,
              backgroundColor: theme.tagPinkBg,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.tagPinkInk }}>
              #{tag}
            </Text>
          </Pressable>
        ))}

        {/* + add button or inline input */}
        {inputVisible ? (
          <View style={{ position: 'relative' }}>
            <TextInput
              ref={inputRef}
              value={tagInput}
              onChangeText={handleChangeText}
              onSubmitEditing={handleSubmit}
              onBlur={handleSubmit}
              placeholder="tag name"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              blurOnSubmit
              autoFocus
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 100,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: theme.borderStrong,
                fontSize: 12,
                fontWeight: '700',
                color: theme.textPrimary,
                minWidth: 80,
              }}
              accessibilityLabel="Tag name input"
            />
            {dropdownVisible && suggestions.length > 0 ? (
              <View style={{
                position: 'absolute',
                top: 34,
                left: 0,
                right: 0,
                backgroundColor: theme.surface,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                zIndex: 10,
                minWidth: 140,
              }}>
                {suggestions.map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => handleSuggestionPress(name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add tag ${name}`}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}
                  >
                    <Text style={{ fontSize: 13, color: theme.textPrimary }}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <Pressable
            onPress={() => setInputVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Add tag"
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 100,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: theme.borderStrong,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>
              + add
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
