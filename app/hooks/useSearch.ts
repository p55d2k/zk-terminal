import { useState, useCallback } from "react";

interface CommandHistory {
  dir: string;
  command: string;
}

export const useSearch = (history: CommandHistory[]) => {
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CommandHistory[]>([]);
  const [searchIndex, setSearchIndex] = useState<number>(-1);

  const startSearch = useCallback(() => {
    setSearchMode(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchIndex(-1);
  }, []);

  const exitSearch = useCallback(() => {
    setSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchIndex(-1);
  }, []);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchIndex(-1);
      return;
    }

    const results = history.filter(cmd =>
      cmd.command.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setSearchIndex(results.length > 0 ? 0 : -1);
  }, [history]);

  const navigateSearch = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up' && searchIndex < searchResults.length - 1) {
      setSearchIndex(searchIndex + 1);
    } else if (direction === 'down' && searchIndex > 0) {
      setSearchIndex(searchIndex - 1);
    } else if (direction === 'down' && searchIndex === 0) {
      setSearchIndex(-1);
    }
  }, [searchIndex, searchResults.length]);

  const selectSearchResult = useCallback((index: number) => {
    if (searchResults[index]) {
      exitSearch();
      return searchResults[index].command;
    }
    return null;
  }, [searchResults, exitSearch]);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  return {
    searchMode,
    searchQuery,
    searchResults,
    searchIndex,
    startSearch,
    exitSearch,
    navigateSearch,
    selectSearchResult,
    updateSearchQuery
  };
};
