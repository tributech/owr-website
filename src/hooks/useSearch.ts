import { useState, useCallback, useRef } from 'react';
import { apiFetch, type SearchResults } from '../lib/api';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useSearch() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((query: string) => {
    clearTimeout(timerRef.current);
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const data = await apiFetch<SearchResults>(
        `/api/v1/search?q=${encodeURIComponent(trimmed)}`,
      );
      if (data) {
        setResults(data);
        setIsOpen(true);
      }
    }, DEBOUNCE_MS);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { results, isOpen, search, close };
}
