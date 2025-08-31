import { useState, useCallback } from "react";

interface CommandHistory {
  dir: string;
  command: string;
}

export const useCommandHistory = () => {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const addCommand = useCallback(
    (dir: string, command: string, output: string) => {
      const newHistory = [...history, { dir, command }];
      setHistory(newHistory);
      setOutputHistory([...outputHistory, output]);
      setHistoryIndex(-1);
    },
    [history, outputHistory]
  );

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        return history[history.length - 1 - newIndex].command;
      } else if (direction === "down" && historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        return history[history.length - 1 - newIndex].command;
      } else if (direction === "down" && historyIndex === 0) {
        setHistoryIndex(-1);
        return "";
      }
      return null;
    },
    [history, historyIndex]
  );

  const updateCommandOutput = useCallback(
    (index: number, output: string) => {
      const newOutputHistory = [...outputHistory];
      newOutputHistory[index] = output;
      setOutputHistory(newOutputHistory);
    },
    [outputHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setOutputHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    outputHistory,
    historyIndex,
    addCommand,
    navigateHistory,
    clearHistory,
    updateCommandOutput,
  };
};
