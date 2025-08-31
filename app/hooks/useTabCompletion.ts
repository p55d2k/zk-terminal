import { useState, useCallback } from "react";
import { commands } from "@/lib/commands/index";
import { fuzzyMatch, getFuzzyCompletions } from "@/lib/utils/fuzzy-match";

export const useTabCompletion = (currentDir: string) => {
  const [tabPressCount, setTabPressCount] = useState<number>(0);
  const [lastCompletions, setLastCompletions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getCompletions = useCallback((input: string): string[] => {
    const parts = input.split(" ");
    if (parts.length === 1) {
      // Complete command with fuzzy matching
      return getFuzzyCompletions(input, commands);
    } else {
      // Complete file/path with fuzzy matching
      const lastPart = parts[parts.length - 1];
      const pathParts = lastPart.split("/");
      const dirPath = pathParts.slice(0, -1).join("/") || currentDir;
      const filePrefix = pathParts[pathParts.length - 1];

      try {
        const { getContentFromPath } = require("@/lib/filesystem/navigation");
        const fullDirPath = dirPath.startsWith("/")
          ? dirPath
          : dirPath === "."
          ? currentDir
          : dirPath === ".."
          ? currentDir.split("/").slice(0, -1).join("/") || "/"
          : currentDir + "/" + dirPath;

        const content = getContentFromPath(fullDirPath);
        if (content instanceof Error) return [];

        const fileNames = content.map((item: any) => {
          const baseName = item.name + (item.type === "directory" ? "/" : "");
          if (pathParts.length > 1) {
            return lastPart.replace(/[^/]*$/, baseName);
          }
          return baseName;
        });

        return getFuzzyCompletions(filePrefix, fileNames);
      } catch {
        return [];
      }
    }
  }, [currentDir]);

  const handleTabCompletion = useCallback((currentCommand: string) => {
    const completions = getCompletions(currentCommand);

    if (completions.length === 0) {
      // No completions available
      setTabPressCount(0);
      setLastCompletions([]);
      setShowSuggestions(false);
      setSuggestions([]);
      return { newCommand: currentCommand, showSuggestions: false };
    }

    if (completions.length === 1) {
      // Single completion - apply it
      const parts = currentCommand.split(" ");
      if (parts.length === 1) {
        const newCommand = completions[0];
        setTabPressCount(0);
        setLastCompletions([]);
        setShowSuggestions(false);
        setSuggestions([]);
        return { newCommand, showSuggestions: false };
      } else {
        parts[parts.length - 1] = completions[0];
        const newCommand = parts.join(" ");
        setTabPressCount(0);
        setLastCompletions([]);
        setShowSuggestions(false);
        setSuggestions([]);
        return { newCommand, showSuggestions: false };
      }
    } else {
      // Multiple completions
      if (tabPressCount === 0 || JSON.stringify(completions) !== JSON.stringify(lastCompletions)) {
        // First tab press or new completions - show common prefix and suggestions
        const prefix = completions.reduce((p, c) => {
          let i = 0;
          while (i < p.length && i < c.length && p[i] === c[i]) i++;
          return p.slice(0, i);
        });

        let newCommand = currentCommand;
        if (prefix.length > currentCommand.split(" ")[currentCommand.split(" ").length - 1].length) {
          const parts = currentCommand.split(" ");
          parts[parts.length - 1] = prefix;
          newCommand = parts.join(" ");
        }

        setTabPressCount(1);
        setLastCompletions(completions);
        setShowSuggestions(true);
        setSuggestions(completions);

        // Hide suggestions after 3 seconds
        setTimeout(() => {
          setShowSuggestions(false);
          setSuggestions([]);
        }, 3000);

        return { newCommand, showSuggestions: true };
      } else {
        // Subsequent tab presses - cycle through options
        const currentPart = currentCommand.split(" ")[currentCommand.split(" ").length - 1];
        const currentIndex = completions.findIndex(comp => comp.startsWith(currentPart));

        if (currentIndex >= 0) {
          const nextIndex = (currentIndex + 1) % completions.length;
          const parts = currentCommand.split(" ");
          parts[parts.length - 1] = completions[nextIndex];
          const newCommand = parts.join(" ");
          setTabPressCount(tabPressCount + 1);
          return { newCommand, showSuggestions: true };
        }
      }
    }

    return { newCommand: currentCommand, showSuggestions: false };
  }, [getCompletions, tabPressCount, lastCompletions]);

  const resetTabCompletion = useCallback(() => {
    setTabPressCount(0);
    setLastCompletions([]);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  return {
    showSuggestions,
    suggestions,
    handleTabCompletion,
    resetTabCompletion
  };
};
