import React, { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useCaptureStore } from '@/stores/captureStore';
import { useTheme } from '@/theme/useTheme';
import { useTagAutocomplete } from '@/hooks/useTagAutocomplete';

// Purple accent for the "create" button — same in both modes
const PURPLE_ACCENT = '#7C5CFC';

const TAG_COLORS = ['pink', 'purple', 'blue', 'green'] as const;
type TagColor = typeof TAG_COLORS[number];

function tagColor(name: string): TagColor {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

function TagPill({
  name,
  color,
  dimmed,
  onPress,
  theme,
}: {
  name: string;
  color: TagColor;
  dimmed?: boolean;
  onPress?: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const bg  = { pink: theme.tagPinkBg,   purple: theme.tagPurpleBg, blue: theme.tagBlueBg,   green: theme.tagGreenBg   }[color];
  const ink = { pink: theme.tagPinkInk,  purple: theme.tagPurpleInk, blue: theme.tagBlueInk, green: theme.tagGreenInk  }[color];

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ opacity: dimmed ? 0.45 : 1 }} accessibilityRole="button">
      <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: bg }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: ink }}>
          {dimmed ? '✓ ' : ''}{name}
        </Text>
      </View>
    </Pressable>
  );
}

export function TagSection() {
  const { tagInput, tags, setTagInput, addTag, removeTag } = useCaptureStore();
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const { suggestions, hasNoMatch } = useTagAutocomplete(tagInput, tags);

  const handleOpen = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    if (tagInput.trim()) addTag(tagInput.trim());
    setTagInput('');
    setExpanded(false);
    setFocused(false);
  };

  const handleCreateNew = () => {
    addTag(tagInput.trim());
    setTagInput('');
    setExpanded(false);
    setFocused(false);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>

      {/* Selected chips + "+ add" button */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: expanded ? 8 : 0 }}>
        {tags.map((tag) => (
          <Pressable key={tag} onPress={() => removeTag(tag)} accessibilityRole="button" accessibilityLabel={`Remove tag ${tag}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: theme.tagPinkBg }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.tagPinkInk }}>#{tag}</Text>
              <Text style={{ fontSize: 13, color: theme.tagPinkInk, opacity: 0.65 }}>×</Text>
            </View>
          </Pressable>
        ))}

        {!expanded && (
          <Pressable onPress={handleOpen} accessibilityRole="button" accessibilityLabel="Add tag"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.borderStrong }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 16 }}>+</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>add</Text>
          </Pressable>
        )}
      </View>

      {/* Inline accordion panel — exact match to prototype Option B */}
      {expanded && (
        // Shadow wrapper (overflow visible so shadow renders on iOS)
        <View style={{
          borderRadius: 24,
          shadowColor: '#7F7FD5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.10,
          shadowRadius: 14,
          elevation: 4,
        }}>
        {/* Clip wrapper (overflow hidden to clip children to border-radius) */}
        <View style={{
          backgroundColor: theme.surface,
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: theme.borderStrong,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 0.72,             // 0.06em × 12px
              textTransform: 'uppercase',
              color: theme.textMuted,          // #9B9BAD
            }}>
              Add tag
            </Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close tag panel"
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: theme.surfaceSunken,  // #F4F4FB
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 22 }}>×</Text>
            </Pressable>
          </View>

          {/* Search wrap */}
          <View style={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              backgroundColor: theme.surfaceSunken,       // #F4F4FB
              borderWidth: 0,
              borderRadius: 20,                            // --radius-lg = 20px in prototype CSS
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}>
              {/* Magnifying glass: circle + handle */}
              <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: theme.textMuted }} />
                <View style={{ position: 'absolute', width: 1.5, height: 5, backgroundColor: theme.textMuted, borderRadius: 1, bottom: 0, right: 2, transform: [{ rotate: '-45deg' }] }} />
              </View>
              <TextInput
                ref={inputRef}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleClose}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="search or create tag…"
                placeholderTextColor={theme.textMuted}
                returnKeyType="done"
                blurOnSubmit={false}
                style={{ flex: 1, fontSize: 14, fontWeight: '500', color: theme.textPrimary, padding: 0 }}
                accessibilityLabel="Tag search input"
              />
            </View>
          </View>

          {hasNoMatch && (
            <Pressable
              onPress={handleCreateNew}
              accessibilityRole="button"
              accessibilityLabel={`Create tag ${tagInput.trim()}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 8, marginBottom: 2, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: theme.surfaceSunken, borderWidth: 1, borderColor: theme.borderStrong }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.tagPinkBg }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.tagPinkInk }}>#{tagInput.trim()}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: theme.textSecondary }}>
                create new tag
              </Text>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: PURPLE_ACCENT, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginTop: -1 }}>+</Text>
              </View>
            </Pressable>
          )}

          {/* Tag grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingTop: 10, paddingHorizontal: 12, paddingBottom: 12 }}>
            {suggestions.length === 0 && !hasNoMatch ? (
              <Text style={{ fontSize: 12, color: theme.textMuted, paddingVertical: 4 }}>
                No tags yet — type a name above to create one
              </Text>
            ) : (
              suggestions.map((name) => {
                const isSelected = tags.includes(name);
                return (
                  <TagPill
                    key={name}
                    name={`#${name}`}
                    color={tagColor(name)}
                    dimmed={isSelected}
                    onPress={isSelected ? undefined : () => { addTag(name); }}
                    theme={theme}
                  />
                );
              })
            )}
          </View>

        </View>
        </View>
      )}
    </View>
  );
}
