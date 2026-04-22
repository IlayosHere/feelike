import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TagChip } from '@/components/ui/TagChip';
import { useTags } from '@/hooks/useTags';
import { useCaptureStore } from '@/stores/captureStore';

const AUTOSUGGEST_MIN_LENGTH = 1;
const MAX_SUGGESTIONS = 4;

export function TagSection() {
  const { tagInput, tags, setTagInput, addTag, removeTag } = useCaptureStore();
  const { data: allTags } = useTags();
  const inputRef = useRef<TextInput>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const suggestions =
    tagInput.length >= AUTOSUGGEST_MIN_LENGTH && allTags
      ? allTags
          .map((t) => t.name)
          .filter(
            (name) =>
              name.toLowerCase().includes(tagInput.toLowerCase()) &&
              !tags.includes(name),
          )
          .slice(0, MAX_SUGGESTIONS)
      : [];

  const handleSubmit = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setDropdownVisible(false);
    }
  };

  const handleSuggestionPress = (name: string) => {
    addTag(name);
    setDropdownVisible(false);
    inputRef.current?.focus();
  };

  const handleChangeText = (text: string) => {
    setTagInput(text);
    setDropdownVisible(text.length >= AUTOSUGGEST_MIN_LENGTH);
  };

  return (
    <View className="mt-3 px-4">
      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-1"
          keyboardShouldPersistTaps="handled"
        >
          {tags.map((tag, index) => (
            <TagChip
              key={tag}
              label={tag}
              colorIndex={index}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View>
        <TextInput
          ref={inputRef}
          value={tagInput}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Add tag..."
          placeholderTextColor="#9B9BAD"
          returnKeyType="done"
          blurOnSubmit={false}
          className="h-10 text-text-primary text-body"
          accessibilityLabel="Add tag"
        />

        {dropdownVisible && suggestions.length > 0 ? (
          <View className="absolute top-10 left-0 right-0 bg-surface rounded-md border border-border z-10">
            {suggestions.map((name) => (
              <Pressable
                key={name}
                onPress={() => handleSuggestionPress(name)}
                accessibilityRole="button"
                accessibilityLabel={`Add tag ${name}`}
                className="px-3 py-2.5 border-b border-border last:border-b-0"
              >
                <Text className="text-text-primary text-body">{name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
