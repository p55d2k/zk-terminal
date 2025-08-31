import { useCallback } from "react";

interface KeyboardShortcutsProps {
  onClearScreen: () => void;
  onStartSearch: () => void;
  onExitSearch: () => void;
  onNavigateHistory: (direction: 'up' | 'down') => string | null;
  onNavigateSearch: (direction: 'up' | 'down') => void;
  onSelectSearchResult: (index: number) => string | null;
  onHandleTabCompletion: (command: string) => { newCommand: string; showSuggestions: boolean };
  onResetTabCompletion: () => void;
  onUpdateSearchQuery: (query: string) => void;
  searchMode: boolean;
  searchIndex: number;
  searchResults: any[];
  searchQuery: string;
  historyIndex: number;
  currentCommand: string;
  setCurrentCommand: (command: string) => void;
}

export const useKeyboardShortcuts = ({
  onClearScreen,
  onStartSearch,
  onExitSearch,
  onNavigateHistory,
  onNavigateSearch,
  onSelectSearchResult,
  onHandleTabCompletion,
  onResetTabCompletion,
  onUpdateSearchQuery,
  searchMode,
  searchIndex,
  searchResults,
  searchQuery,
  historyIndex,
  currentCommand,
  setCurrentCommand
}: KeyboardShortcutsProps) => {

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchMode) {
      // Handle search mode
      if (e.key === "Enter") {
        e.preventDefault();
        if (searchIndex >= 0 && searchResults[searchIndex]) {
          const selectedCommand = onSelectSearchResult(searchIndex);
          if (selectedCommand) {
            setCurrentCommand(selectedCommand);
          }
        } else {
          onExitSearch();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExitSearch();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onNavigateSearch('up');
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onNavigateSearch('down');
      } else if (e.key === "Backspace" && searchQuery === "") {
        onExitSearch();
      } else {
        // Update search query
        const newQuery = e.key === "Backspace"
          ? searchQuery.slice(0, -1)
          : searchQuery + e.key;
        onUpdateSearchQuery(newQuery);
      }
      return;
    }

    // Normal mode
    if (e.key === "Enter") {
      // This will be handled by the parent component
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const command = onNavigateHistory('up');
      if (command !== null) {
        setCurrentCommand(command);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const command = onNavigateHistory('down');
      if (command !== null) {
        setCurrentCommand(command);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const result = onHandleTabCompletion(currentCommand);
      setCurrentCommand(result.newCommand);
    } else if (e.ctrlKey && e.key === "c") {
      setCurrentCommand("");
      onResetTabCompletion();
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      onClearScreen();
    } else if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      onStartSearch();
    } else if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      // Exit terminal (Ctrl+D)
      if (currentCommand === "") {
        // If input is empty, clear screen
        onClearScreen();
      }
    }
  }, [
    searchMode,
    searchIndex,
    searchResults,
    searchQuery,
    currentCommand,
    onClearScreen,
    onStartSearch,
    onExitSearch,
    onNavigateHistory,
    onNavigateSearch,
    onSelectSearchResult,
    onHandleTabCompletion,
    onResetTabCompletion,
    onUpdateSearchQuery,
    setCurrentCommand
  ]);

  return { handleKeyDown };
};
