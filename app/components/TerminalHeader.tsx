import { memo } from "react";

interface TerminalHeaderProps {
  cleared: boolean;
}

const TerminalHeader = memo<TerminalHeaderProps>(({ cleared }) => {
  if (cleared) return null;

  return (
    <div className="mb-2">
      <p className="text-green-400">zk-terminal v1.0</p>
      <p className="text-gray-400 text-sm sm:text-base">
        Type &apos;help&apos; for commands. ↑/↓ history, Tab completion,
        Ctrl+C clear input, Ctrl+L clear screen, Ctrl+R search history,
        Ctrl+D exit.
      </p>
    </div>
  );
});

TerminalHeader.displayName = "TerminalHeader";

export default TerminalHeader;
