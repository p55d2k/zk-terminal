import { memo, useCallback } from "react";

interface CommandHistoryItem {
  dir: string;
  command: string;
}

interface CommandHistoryProps {
  history: CommandHistoryItem[];
  outputHistory: string[];
  getOutputClass: (output: string) => string;
  getOutputIcon: (output: string) => string;
}

const CommandHistory = memo<CommandHistoryProps>(({
  history,
  outputHistory,
  getOutputClass,
  getOutputIcon
}) => {
  return (
    <>
      {history.map((command, index) => (
        <div className="flex flex-col w-full mb-1" key={index}>
          <div className="flex flex-row space-x-2">
            <p className="flex flex-row space-x-2 text-green-400 flex-shrink-0">
              <span className="hidden sm:inline">zk-terminal</span>
              <span className="sm:hidden">zk</span>
              <span>{command.dir}</span>
              <span>$</span>
            </p>
            <p className="w-full text-white break-all ml-4">{command.command}</p>
          </div>
          <pre
            className={`whitespace-pre-wrap pl-4 sm:pl-0 ${getOutputClass(
              outputHistory[index] || ""
            )} break-all`}
          >
            {getOutputIcon(outputHistory[index] || "")}
            {outputHistory[index] || ""}
          </pre>
        </div>
      ))}
    </>
  );
});

CommandHistory.displayName = "CommandHistory";

export default CommandHistory;
