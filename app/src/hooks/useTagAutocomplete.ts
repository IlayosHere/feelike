import { useTags } from '@/hooks/useTags';

const AUTOSUGGEST_MIN_LENGTH = 1;
const MAX_SUGGESTIONS = 4;

export function useTagAutocomplete(input: string, selectedTags: string[]) {
  const { data: allTags } = useTags();
  const suggestions =
    input.length >= AUTOSUGGEST_MIN_LENGTH && allTags
      ? allTags
          .map((t) => t.name)
          .filter(
            (name) =>
              name.toLowerCase().includes(input.toLowerCase()) &&
              !selectedTags.includes(name),
          )
          .slice(0, MAX_SUGGESTIONS)
      : [];
  const showDropdown = input.length >= AUTOSUGGEST_MIN_LENGTH && suggestions.length > 0;
  return { suggestions, showDropdown };
}
