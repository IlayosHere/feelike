import { useState, useMemo } from 'react';

export type DateRange = { from: Date; to: Date };

export type TimelineFilter = {
  dateRange: DateRange | null;
  activeTags: string[];
  setDateRange: (range: DateRange | null) => void;
  toggleTag: (tag: string) => void;
  clearAll: () => void;
  isActive: boolean;
};

export function useTimelineFilter(): TimelineFilter {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAll = () => {
    setDateRange(null);
    setActiveTags([]);
  };

  const isActive = useMemo(
    () => dateRange !== null || activeTags.length > 0,
    [dateRange, activeTags],
  );

  return { dateRange, activeTags, setDateRange, toggleTag, clearAll, isActive };
}
