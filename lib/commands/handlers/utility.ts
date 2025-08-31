import { CommandContext } from "../../types";
import { resetData } from "../../filesystem";

export const handleClear = (
  args: string[],
  context: CommandContext
): string => {
  return "";
};

export const handleReset = (
  args: string[],
  context: CommandContext
): string => {
  resetData();
  context.setCurrentDir("/");
  if (typeof window !== "undefined") {
    // Force page reload to ensure all data is properly reset
    window.location.reload();
  }
  return "Filesystem reset. Reloading...";
};

export const handleHelp = (args: string[], context: CommandContext): string => {
  const category = args[0]?.toLowerCase();

  if (!category || category === "all") {
    return `Available command categories:
  help fileops     - File operations (ls, cd, pwd, etc.)
  help search      - Search and utility commands
  help shortcuts   - Keyboard shortcuts
  help features    - Advanced features
  help all         - Show complete help

Use 'help <category>' for detailed information.`;
  }

  switch (category) {
    case "fileops":
      return `File Operations:
  ls [path] [--page N] [--page-size N] - List directory contents (with pagination)
  ls -l [path] [--page N] [--page-size N] - List directory contents with details
  cd <path>          - Change directory
  pwd                - Print working directory
  cat <file>         - Display file contents with syntax highlighting
  touch <file>       - Create empty file
  mkdir <dir>        - Create directory
  rm [-r] <path>     - Remove file or directory
  mv <src> <dest>    - Move/rename file or directory
  cp <src> <dest>    - Copy file or directory
  chmod <perm> <path> - Change file permissions
  ln <target> <link> - Create symbolic link`;

    case "search":
      return `Search & Utilities:
  find <pattern> [path] - Search for files
  grep <pattern> [path] [-i] - Search text in files
  gzip <file>        - Compress file
  gunzip <file>      - Decompress file
  tar -c -f <archive> <files...> - Create archive
  tar -x -f <archive> [dest] - Extract archive
  nano <file>        - Edit file with nano editor
  vim <file>         - Edit file with vim editor
  clear              - Clear screen
  reset              - Reset filesystem (WARNING: deletes all data)
  help               - Show this help`;

    case "shortcuts":
      return `Keyboard shortcuts:
  ↑/↓                - Navigate command history
  Tab                - Auto-complete commands and paths
  Ctrl+C             - Clear current input
  Ctrl+L             - Clear screen
  Ctrl+R             - Search command history
  Ctrl+D             - Exit terminal

Editor shortcuts:
  Nano: Ctrl+X save, Ctrl+C exit
  Vim:  Esc (insert→command), :q quit, :wq save+quit, :q! force quit`;

    case "features":
      return `Advanced features:
  Command chaining with ; && |
  Syntax highlighting for 10+ file types
  Tab completion with suggestions
  Reverse search through history
  File compression and archiving
  Lazy loading for large directories
  Performance optimizations with caching
  Focus locking - cursor stays in terminal input`;

    default:
      return `Unknown category '${category}'. Use 'help' for available categories.`;
  }
};
