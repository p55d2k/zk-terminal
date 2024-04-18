"use client";

import { handleLastCommand } from "@/lib/handler";
import { useState } from "react";

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

  const handleCommandEntered = () => {
    const newHistory = [
      ...history,
      { dir: currentDir, command: currentCommand },
    ];
    setHistory(newHistory);

    const output = handleLastCommand(currentCommand, currentDir, setCurrentDir);
    setOutputHistory([...outputHistory, output]);
    setCurrentCommand("");

    if (output.startsWith("error")) {
      return;
    }

    if (currentCommand === "clear") {
      clearScreen();
    }
  };

  const clearScreen = () => {
    setCleared(true);
    setHistory([]);
    setOutputHistory([]);
  };

  return (
    <div className="flex flex-col h-screen text-lg">
      {!cleared && (
        <div className="mb-1">
          <p>zk-terminal v1.0</p>
          <p>Use TAB to jump to the prompt.</p>
        </div>
      )}
      <div className="flex flex-col">
        {history.map((command, index) => (
          <div className="flex flex-col w-full" key={index}>
            <div className="flex flex-row space-x-2">
              <p className="flex flex-row space-x-1">
                <span className="w-[130px]">zk-terminal:</span>
                <span>{command.dir}</span>
                <span>$</span>
              </p>
              <p className="w-full">{command.command}</p>
            </div>
            <p>{outputHistory[index]}</p>
          </div>
        ))}
        <div className="flex flex-row space-x-2 w-full">
          <p className="flex flex-row space-x-1">
            <span className="w-[130px]">zk-terminal:</span>
            <span>{currentDir}</span>
            <span>$</span>
          </p>
          <input
            type="text"
            className="w-full bg-black text-white outline-none"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCommandEntered();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
