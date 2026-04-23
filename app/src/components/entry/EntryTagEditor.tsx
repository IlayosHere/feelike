import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { TagChip } from '@/components/ui/TagChip';
import { useTagAutocomplete } from '@/hooks/useTagAutocomplete';
import { useTheme } from '@/theme/useTheme';

export type EntryTagEditorProps = {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

export function EntryTagEditor({ tags, onAdd, onRemove }: EntryTagEditorProps) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { suggestions, showDropdown } = useTagAutocomplete(input, tags);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInput('');
    }
  };

  const handleSuggestion = (name: string) => {
    onAdd(name);
    setInput('');
    inputRef.current?.focus();
  };

  const handleChangeText = (text: string) => {
    setInput(text);
  };

  return (
    <View>
      {tags.length > 0 ? (
        <View className="flex-row flex-wrap mb-2">
          {tags.map((tag, index) => (
            <TagChip
              key={tag}
              label={tag}
              colorIndex={index}
              onRemove={() => onRemove(tag)}
            />
          ))}
        </View>
      ) : null}

      <View>
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Add tag..."
          placeholderTextColor={theme.textSecondary}
          returnKeyType="done"
          blurOnSubmit={false}
          className="h-10 text-text-primary text-body"
          accessibilityLabel="Add tag"
        />

        {showDropdown ? (
          <View className="absolute top-10 left-0 right-0 bg-surface rounded-md border border-border z-10">
            {suggestions.map((name) => (
              <Pressable
                key={name}
                onPress={() => handleSuggestion(name)}
                accessibilityRole="button"
                accessibilityLabel={`Add tag ${name}`}
                className="px-3 py-2.5 border-b border-border"
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
