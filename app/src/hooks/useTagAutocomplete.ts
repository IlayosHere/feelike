import { useTags } from '@/hooks/useTags';

const MAX_SUGGESTIONS = 12;

export function useTagAutocomplete(input: string, selectedTags: string[]) {
  const { data: allTags } = useTags();

  if (!allTags) return { suggestions: [], allNames: [], hasNoMatch: false };

  const allNames = allTags.map((t) => t.name);
  const trimmed = input.trim().toLowerCase();

  const suggestions = (
    trimmed.length === 0
      ? allNames
      : allNames.filter((name) => name.toLowerCase().includes(trimmed))
  ).slice(0, MAX_SUGGESTIONS);

  const hasNoMatch =
    trimmed.length > 0 &&
    suggestions.length === 0 &&
    !selectedTags.includes(input.trim());

  return { suggestions, allNames, hasNoMatch };
}
