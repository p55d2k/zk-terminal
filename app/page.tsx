"use client";

import { handleLastCommand } from "@/lib/handler";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import CommandHistory from "./components/CommandHistory";
import TerminalHeader from "./components/TerminalHeader";
import SearchInterface from "./components/SearchInterface";
import TerminalInput, { TerminalInputRef } from "./components/TerminalInput";
import TextEditor from "./components/TextEditor";
import { useCommandHistory } from "./hooks/useCommandHistory";
import { useSearch } from "./hooks/useSearch";
import { useTabCompletion } from "./hooks/useTabCompletion";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

interface CommandHistory {
  dir: string;
  command: string;
}

const Home = memo(() => {
  const [currentDir, setCurrentDir] = useState<string>("/home/user");
  const [cleared, setCleared] = useState<boolean>(false);
  const [currentCommand, setCurrentCommand] = useState<string>("");

  // Editor state
  const [editorMode, setEditorMode] = useState<{
    isOpen: boolean;
    filePath: string;
    editorType: "nano" | "vim";
    commandIndex?: number; // Track which command in history opened the editor
  } | null>(null);

  const inputRef = useRef<TerminalInputRef>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement | null>(null);

  // Custom hooks
  const {
    history,
    outputHistory,
    addCommand,
    navigateHistory,
    clearHistory,
    updateCommandOutput,
  } = useCommandHistory();
  const {
    searchMode,
    searchQuery,
    searchResults,
    searchIndex,
    startSearch,
    exitSearch,
    navigateSearch,
    selectSearchResult,
    updateSearchQuery,
  } = useSearch(history);
  const {
    showSuggestions,
    suggestions,
    handleTabCompletion,
    resetTabCompletion,
  } = useTabCompletion(currentDir);

  // Memoized callbacks
  const getOutputClass = useCallback((output: string) => {
    if (!output) return "text-white";
    if (output.startsWith("error")) return "text-red-500";
    if (output.trim() === "") return "text-green-500";
    return "text-white";
  }, []);

  const getOutputIcon = useCallback((output: string) => {
    if (!output) return "";
    if (output.startsWith("error")) return "✗ ";
    if (output.trim() === "") return "✓ ";
    return "";
  }, []);

  // Convert path to tilde notation for display
  const displayPath = useMemo(() => {
    if (currentDir === "/home/user") {
      return "~";
    }
    if (currentDir.startsWith("/home/user/")) {
      return "~" + currentDir.substring("/home/user".length);
    }
    return currentDir;
  }, [currentDir]);

  const clearScreen = useCallback(() => {
    setCleared(true);
    clearHistory();
  }, [clearHistory]);

  const handleEditorClose = useCallback(() => {
    setEditorMode(null);
  }, []);

  const handleEditorSave = useCallback(
    (content: string) => {
      // Update the output of the existing command that opened the editor
      if (editorMode?.commandIndex !== undefined) {
        const message = `File saved: ${editorMode.filePath}`;
        updateCommandOutput(editorMode.commandIndex, message);
      }
      setEditorMode(null);
    },
    [editorMode, updateCommandOutput]
  );

  const handleCommandEntered = useCallback(async () => {
    if (!currentCommand.trim()) return;
    const output = await handleLastCommand(
      currentCommand,
      currentDir,
      setCurrentDir
    );

    // Check if output indicates editor should open
    if (output.startsWith("__OPEN_EDITOR__:")) {
      const [, filePath, editorType] = output.split(":");
      // Add the command to history before opening editor and get its index
      addCommand(currentDir, currentCommand, "");
      const commandIndex = history.length; // This will be the index of the command we just added
      setEditorMode({
        isOpen: true,
        filePath,
        editorType: editorType as "nano" | "vim",
        commandIndex,
      });
      setCurrentCommand("");
      return;
    }

    addCommand(currentDir, currentCommand, output);
    setCurrentCommand("");
    if (currentCommand === "clear") {
      clearScreen();
    }
  }, [currentCommand, currentDir, addCommand, clearScreen, history.length]);

  // Keyboard shortcuts hook
  const { handleKeyDown } = useKeyboardShortcuts({
    onClearScreen: clearScreen,
    onStartSearch: startSearch,
    onExitSearch: exitSearch,
    onNavigateHistory: navigateHistory,
    onNavigateSearch: navigateSearch,
    onSelectSearchResult: selectSearchResult,
    onHandleTabCompletion: handleTabCompletion,
    onResetTabCompletion: resetTabCompletion,
    onUpdateSearchQuery: updateSearchQuery,
    searchMode,
    searchIndex,
    searchResults,
    searchQuery,
    historyIndex: 0, // This will be managed by useCommandHistory
    currentCommand,
    setCurrentCommand,
  });

  // Mobile detection
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  // Effects
  useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Source .bashrc on startup
  useEffect(() => {
    const sourceBashrc = async () => {
      const bashrcPath = "/home/user/.bashrc";
      try {
        const output = await handleLastCommand(
          `source ${bashrcPath}`,
          currentDir,
          setCurrentDir,
          true
        );
        // Don't add the output to history, just execute it silently
        if (output && !output.startsWith("error:")) {
          // Successfully sourced .bashrc
        }
      } catch (error) {
        // Silently fail if .bashrc doesn't exist or has errors
      }
    };

    // Only source .bashrc if we're at the home directory (initial load)
    if (currentDir === "/home/user") {
      sourceBashrc();
    }
  }, [currentDir]); // Include currentDir in dependencies

  // Focus locking effect - keep focus on terminal input when not in editor mode
  useEffect(() => {
    if (isMobile || editorMode?.isOpen || searchMode) return;

    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Only prevent focus loss if clicking within the terminal container
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        // Allow focus on the input, but refocus if focus is lost
        setTimeout(focusInput, 0);
      }
    };

    const handleFocus = (e: FocusEvent) => {
      // If focus is lost to something outside the terminal, refocus the input
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setTimeout(focusInput, 0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // If any key is pressed and we're not in the input, focus it
      if (document.activeElement !== inputElementRef.current) {
        focusInput();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent context menu to avoid focus loss
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    // Initial focus
    focusInput();

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isMobile, editorMode?.isOpen, searchMode]);

  // Handle Enter key
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCommandEntered();
      } else {
        handleKeyDown(e);
      }
    },
    [handleCommandEntered, handleKeyDown]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setCurrentCommand(value);
      resetTabCompletion();
    },
    [resetTabCompletion]
  );

  const handleInputBlur = useCallback(() => {
    // Refocus the input if it loses focus and we're not in editor/search mode
    if (!editorMode?.isOpen && !searchMode && !isMobile) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [editorMode?.isOpen, searchMode, isMobile]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-black text-white font-mono text-base sm:text-lg p-4 sm:p-6 items-center justify-center">
        <p className="text-red-500 text-center">
          This terminal is not supported on mobile devices.
        </p>
        <p className="text-gray-400 text-center mt-4">
          Please use a desktop or laptop for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-black text-white font-mono text-base sm:text-lg p-4 sm:p-6"
    >
      <TerminalHeader cleared={cleared} />
      <div className="flex flex-col flex-1 overflow-y-auto" ref={historyRef}>
        <div data-testid="terminal-output">
          <CommandHistory
            history={history}
            outputHistory={outputHistory}
            getOutputClass={getOutputClass}
            getOutputIcon={getOutputIcon}
          />
        </div>
        <div className="flex flex-row space-x-2 w-full">
          <p className="flex flex-row space-x-2 text-green-400 flex-shrink-0">
            <span className="hidden sm:inline">zk-terminal</span>
            <span className="sm:hidden">zk</span>
            <span>{displayPath}</span>
            <span className="text-blue-400">❯</span>
          </p>
          {searchMode ? (
            <SearchInterface
              searchQuery={searchQuery}
              searchResults={searchResults}
              searchIndex={searchIndex}
            />
          ) : (
            <TerminalInput
              ref={inputRef}
              currentCommand={currentCommand}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              inputElementRef={inputElementRef}
            />
          )}
        </div>
      </div>

      {/* Text Editor Overlay */}
      {editorMode?.isOpen && (
        <TextEditor
          filePath={editorMode.filePath}
          editorType={editorMode.editorType}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
});

Home.displayName = "Home";

export default Home;
