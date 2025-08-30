"use client";

import { handleLastCommand } from "@/lib/handler";
import { getContentFromPath } from "@/lib/filesystem";
import { commands } from "@/lib/commands/index";
import { useState, useRef, useEffect } from "react";

interface CommandHistory {
  dir: string;
  command: string;
}

const Home = () => {
  const [currentDir, setCurrentDir] = useState<string>("/");
  const [cleared, setCleared] = useState<boolean>(false);
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [outputHistory, setOutputHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleCommandEntered = () => {
    if (!currentCommand.trim()) return;
    const newHistory = [
      ...history,
      { dir: currentDir, command: currentCommand },
    ];
    setHistory(newHistory);

    const output = handleLastCommand(currentCommand, currentDir, setCurrentDir);
    setOutputHistory([...outputHistory, output]);
    setCurrentCommand("");
    setHistoryIndex(-1);

    if (currentCommand === "clear") {
      clearScreen();
    }
  };

  const clearScreen = () => {
    setCleared(true);
    setHistory([]);
    setOutputHistory([]);
  };

  const getCompletions = (input: string): string[] => {
    const parts = input.split(" ");
    if (parts.length === 1) {
      // Complete command
      return commands.filter((cmd) => cmd.startsWith(input));
    } else {
      // Complete file/path
      const dirContent = getContentFromPath(currentDir);
      if (dirContent instanceof Error) return [];
      return dirContent
        .map((item: any) => item.name)
        .filter((name: string) => name.startsWith(parts[parts.length - 1]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommandEntered();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(history[history.length - 1 - newIndex].command);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(history[history.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completions = getCompletions(currentCommand);
      if (completions.length === 1) {
        const parts = currentCommand.split(" ");
        if (parts.length === 1) {
          setCurrentCommand(completions[0]);
        } else {
          parts[parts.length - 1] = completions[0];
          setCurrentCommand(parts.join(" "));
        }
      } else if (completions.length > 1) {
        // Find common prefix
        const prefix = completions.reduce((p, c) => {
          let i = 0;
          while (i < p.length && i < c.length && p[i] === c[i]) i++;
          return p.slice(0, i);
        });
        if (
          prefix.length >
          currentCommand.split(" ")[currentCommand.split(" ").length - 1].length
        ) {
          const parts = currentCommand.split(" ");
          parts[parts.length - 1] = prefix;
          setCurrentCommand(parts.join(" "));
        }
      }
    } else if (e.ctrlKey && e.key === "c") {
      setCurrentCommand("");
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      clearScreen();
    }
  };

  const getOutputClass = (output: string) => {
    if (output.startsWith("error")) return "text-red-500";
    if (output.trim() === "") return "text-green-500";
    return "text-white";
  };

  const getOutputIcon = (output: string) => {
    if (output.startsWith("error")) return "✗ ";
    if (output.trim() === "") return "✓ ";
    return "";
  };

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
    <div className="flex flex-col h-screen bg-black text-white font-mono text-base sm:text-lg p-4 sm:p-6">
      {!cleared && (
        <div className="mb-2">
          <p className="text-green-400">zk-terminal v1.0</p>
          <p className="text-gray-400 text-sm sm:text-base">
            Type &apos;help&apos; for commands. ↑/↓ history, Tab completion, Ctrl+C clear
            input, Ctrl+L clear screen.
          </p>
        </div>
      )}
      <div className="flex flex-col flex-1 overflow-y-auto" ref={historyRef}>
        {history.map((command, index) => (
          <div className="flex flex-col w-full mb-1" key={index}>
            <div className="flex flex-row space-x-2">
              <p className="flex flex-row space-x-2 text-green-400 flex-shrink-0">
                <span className="hidden sm:inline">zk-terminal</span>
                <span className="sm:hidden">zk</span>
                <span>{command.dir}</span>
                <span>$</span>
              </p>
              <p className="w-full text-white break-all ml-4">
                {command.command}
              </p>
            </div>
            <pre
              className={`whitespace-pre-wrap pl-4 sm:pl-0 ${getOutputClass(
                outputHistory[index]
              )} break-all`}
            >
              {outputHistory[index]}
            </pre>
          </div>
        ))}
        <div className="flex flex-row space-x-2 w-full">
          <p className="flex flex-row space-x-2 text-green-400 flex-shrink-0">
            <span className="hidden sm:inline">zk-terminal</span>
            <span className="sm:hidden">zk</span>
            <span>{currentDir}</span>
            <span>$</span>
          </p>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-black text-white outline-none caret-white flex-1 min-w-0 ml-4 animate-pulse"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal command input"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
