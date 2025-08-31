import { CommandContext } from "../../types";
import { resetData, readFile } from "../../filesystem";
import { pathJoin } from "../../utils";
import { envManager } from "../../env-manager";
import { aliasManager } from "../../alias-manager";

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

export const handleOpen = (args: string[], context: CommandContext): string => {
  const filePath = args[0];
  if (!filePath) {
    return "error: open: missing file operand";
  }

  const fullPath = filePath.startsWith("/")
    ? filePath
    : pathJoin(context.currentDir, filePath);

  // Check if file exists
  const content = readFile(fullPath);
  if (content instanceof Error) {
    return "error: " + content.message;
  }

  // Check if it's an HTML file
  const isHtmlFile =
    fullPath.toLowerCase().endsWith(".html") ||
    fullPath.toLowerCase().endsWith(".htm") ||
    content.trim().startsWith("<!DOCTYPE html>") ||
    content.trim().startsWith("<html");

  if (!isHtmlFile) {
    return "error: open: file is not an HTML file";
  }

  // Create a blob URL for the HTML content and open it in a new tab
  if (typeof window !== "undefined") {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return `Opened ${filePath} in new tab`;
  }

  return "error: open: cannot open file in browser environment";
};

export const handleHelp = (args: string[], context: CommandContext): string => {
  const category = args[0]?.toLowerCase();

  if (!category || category === "all") {
    return `Available command categories:
  help fileops     - File operations (ls, cd, pwd, etc.)
  help search      - Search and utility commands
  help network     - Networking and API commands
  help jobs        - Job control and process management
  help env         - Environment variables and aliases
  help system      - System information commands
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
  which <command> - Locate a command
  type <command> - Display command type
  gzip <file>        - Compress file
  gunzip <file>      - Decompress file
  tar -c -f <archive> <files...> - Create archive
  tar -x -f <archive> [dest] - Extract archive
  nano <file>        - Edit file with nano editor
  vim <file>         - Edit file with vim editor
  open <file>        - Open HTML file in new browser tab
  clear              - Clear screen
  reset              - Reset filesystem (WARNING: deletes all data)
  help               - Show this help`;

    case "network":
      return `Networking & API Commands:
  curl <URL>         - Fetch URL content and display (server-side, auto-normalizes URLs)
  wget <URL>         - Download file and save to current directory (server-side, auto-normalizes URLs)
  wget [options] <URL> - Advanced download with options:
    -m, --mirror                    mirror website (includes -k -p -np)
    -k, --convert-links             convert links in HTML files
    -p, --page-requisites           download page requisites (images, CSS, JS)
    -np, --no-parent                don't ascend to parent directory
    -P, --directory <dir>           save files to specified directory
  api <method> <URL> [data] - Make HTTP API request (server-side proxy)
  ws <URL>           - Test WebSocket connection`;

    case "jobs":
      return `Job Control & Process Management:
  jobs               - List all jobs
  bg <job_id>        - Move job to background
  fg <job_id>        - Bring job to foreground
  kill <job_id|pid>  - Terminate job or process
  ps                 - Show process status (alias for jobs)`;

    case "env":
      return `Environment Variables & Aliases:
  export VAR=value   - Set environment variable
  export             - Show all environment variables
  env [VAR]          - Get or set environment variable
  env                - Show all environment variables
  unset <VAR>        - Remove environment variable
  alias NAME='cmd'   - Create command alias
  alias [NAME]       - Show aliases or specific alias
  alias              - Show all aliases
  unalias <NAME>     - Remove alias
  source <file>      - Execute shell script
  bash <file>        - Execute shell script (same as source)
  . <file>           - Execute shell script (same as source)`;

    case "system":
      return `System Information:
  id [options]       - Print user and group information
  whoami             - Print effective userid
  groups             - Print group memberships
  hostname           - Show or set the system's host name
  uname [options]    - Print system information
  date [options]     - Display or set date and time
  history            - Display command history
  ps                 - Report process status (alias for jobs)`;

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
  Focus locking - cursor stays in terminal input
  Networking commands for HTTP/WebSocket
  API interaction capabilities`;

    default:
      return `Unknown category '${category}'. Use 'help' for available categories.`;
  }
};

// System information commands
export const handleWhich = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    return "error: which: missing operand";
  }

  const command = args[0];
  const pathVar = envManager.getVariable("PATH");

  if (!pathVar) {
    return `which: ${command}: command not found`;
  }

  const paths = pathVar.split(":");
  for (const path of paths) {
    // In a real system, we'd check if the command exists at this path
    // For simulation, we'll just return a plausible path
    if (path && path.trim()) {
      return `${path}/${command}`;
    }
  }

  return `which: ${command}: command not found`;
};

export const handleType = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    return "error: type: missing operand";
  }

  const command = args[0];

  // Check if it's a built-in command
  const builtins = ["cd", "pwd", "echo", "export", "alias", "unalias", "jobs", "bg", "fg", "kill"];
  if (builtins.includes(command)) {
    return `${command} is a shell builtin`;
  }

  // Check if it's an alias
  const alias = aliasManager.getAlias(command);
  if (alias) {
    return `${command} is aliased to '${alias}'`;
  }

  // Check if it's in PATH
  const whichResult = handleWhich(args, context);
  if (!whichResult.startsWith("which:")) {
    return `${command} is ${whichResult}`;
  }

  return `type: ${command}: not found`;
};

export const handleId = (args: string[], context: CommandContext): string => {
  const uid = envManager.getVariable("UID") || "1000";
  const gid = envManager.getVariable("GROUPS") || "1000";
  const user = envManager.getVariable("USER") || "user";

  if (args.includes("-u")) {
    return uid;
  } else if (args.includes("-g")) {
    return gid;
  } else if (args.includes("-n")) {
    return user;
  } else {
    return `uid=${uid}(${user}) gid=${gid}(${user}) groups=${gid}(${user})`;
  }
};

export const handleWhoami = (args: string[], context: CommandContext): string => {
  return envManager.getVariable("USER") || "user";
};

export const handleGroups = (args: string[], context: CommandContext): string => {
  const user = envManager.getVariable("USER") || "user";
  const groups = envManager.getVariable("GROUPS")?.split(",") || ["users"];
  return groups.join(" ");
};

export const handleHostname = (args: string[], context: CommandContext): string => {
  return envManager.getVariable("HOSTNAME") || "zk-terminal";
};

export const handleUname = (args: string[], context: CommandContext): string => {
  if (args.includes("-a")) {
    return "Linux zk-terminal 5.15.0-zk #1 SMP Wed Aug 31 12:00:00 UTC 2025 x86_64 GNU/Linux";
  } else if (args.includes("-n")) {
    return envManager.getVariable("HOSTNAME") || "zk-terminal";
  } else if (args.includes("-r")) {
    return "5.15.0-zk";
  } else if (args.includes("-s")) {
    return "Linux";
  } else {
    return "Linux";
  }
};

export const handleDate = (args: string[], context: CommandContext): string => {
  const now = new Date();
  if (args.includes("-u")) {
    return now.toUTCString();
  } else if (args.includes("-R")) {
    return now.toUTCString().replace("GMT", "+0000");
  } else if (args.includes("+%s")) {
    return Math.floor(now.getTime() / 1000).toString();
  } else {
    return now.toLocaleString();
  }
};

export const handleHistory = (args: string[], context: CommandContext): string => {
  // This would normally show command history
  // For now, just return a message
  return "Command history feature is available through ↑/↓ keys";
};
