// ANSI color codes for syntax highlighting
export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
};

export const highlightJavaScript = (content: string): string => {
  return (
    content
      // Keywords
      .replace(
        /\b(const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|new|this|class|extends|super|import|export|from|async|await|yield|typeof|instanceof|in|of)\b/g,
        colors.blue + "$1" + colors.reset
      )
      // Strings
      .replace(/(["'`])(.*?)\1/g, colors.green + "$1$2$1" + colors.reset)
      // Comments
      .replace(/(\/\/.*$)/gm, colors.cyan + "$1" + colors.reset)
      .replace(/(\/\*[\s\S]*?\*\/)/g, colors.cyan + "$1" + colors.reset)
      // Numbers
      .replace(/\b\d+(\.\d+)?\b/g, colors.yellow + "$1" + colors.reset)
      // Function calls
      .replace(/(\w+)\s*\(/g, colors.brightBlue + "$1" + colors.reset + "(")
      // Object properties
      .replace(/(\w+):/g, colors.brightMagenta + "$1" + colors.reset + ":")
  );
};

export const highlightTypeScript = (content: string): string => {
  return (
    content
      // TypeScript specific keywords
      .replace(
        /\b(interface|type|enum|namespace|abstract|implements|readonly|private|protected|public|static|as|is)\b/g,
        colors.magenta + "$1" + colors.reset
      )
      // Apply JavaScript highlighting first
      .replace(content, highlightJavaScript(content))
  );
};

export const highlightJSON = (content: string): string => {
  return (
    content
      // Keys
      .replace(/"([^"]+)":/g, colors.brightCyan + '"$1"' + colors.reset + ":")
      // Strings
      .replace(/:\s*"([^"]*)"/g, ": " + colors.green + '"$1"' + colors.reset)
      // Numbers
      .replace(/:\s*(\d+(\.\d+)?)/g, ": " + colors.yellow + "$1" + colors.reset)
      // Booleans and null
      .replace(
        /:\s*(true|false|null)/g,
        ": " + colors.red + "$1" + colors.reset
      )
  );
};

export const highlightHTML = (content: string): string => {
  return (
    content
      // Tags
      .replace(/<\/?[\w\s="/.':;#-\/\?]+>/gi, colors.blue + "$1" + colors.reset)
      // Attributes
      .replace(
        /(\w+)="([^"]*)"/g,
        colors.brightGreen +
          "$1" +
          colors.reset +
          '="' +
          colors.green +
          "$2" +
          colors.reset +
          '"'
      )
      // Comments
      .replace(/(<!--[\s\S]*?-->)/g, colors.cyan + "$1" + colors.reset)
  );
};

export const highlightCSS = (content: string): string => {
  return (
    content
      // Selectors
      .replace(/^([^{]+){/gm, colors.blue + "$1" + colors.reset + "{")
      // Properties
      .replace(
        /(\w[\w-]*)\s*:/g,
        colors.brightGreen + "$1" + colors.reset + ":"
      )
      // Values
      .replace(/:\s*([^;]+);/g, ": " + colors.green + "$1" + colors.reset + ";")
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, colors.cyan + "$1" + colors.reset)
  );
};

export const highlightMarkdown = (content: string): string => {
  return (
    content
      // Headers
      .replace(
        /^(#{1,6})\s+(.+)$/gm,
        colors.blue +
          "$1" +
          colors.reset +
          " " +
          colors.brightWhite +
          "$2" +
          colors.reset
      )
      // Bold
      .replace(/\*\*(.*?)\*\*/g, colors.yellow + "**$1**" + colors.reset)
      // Italic
      .replace(/\*(.*?)\*/g, colors.cyan + "*$1*" + colors.reset)
      // Code blocks
      .replace(/```[\s\S]*?```/g, colors.green + "$&" + colors.reset)
      // Inline code
      .replace(/`([^`]+)`/g, colors.green + "$1" + colors.reset)
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        colors.blue +
          "[$1]" +
          colors.reset +
          "(" +
          colors.cyan +
          "$2" +
          colors.reset +
          ")"
      )
  );
};

export const getFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "md":
      return "markdown";
    case "py":
      return "python";
    case "java":
      return "java";
    case "cpp":
    case "c":
    case "h":
      return "cpp";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "sh":
    case "bash":
      return "shell";
    default:
      return "text";
  }
};

export const highlightContent = (content: string, fileType: string): string => {
  switch (fileType) {
    case "javascript":
      return highlightJavaScript(content);
    case "typescript":
      return highlightTypeScript(content);
    case "json":
      return highlightJSON(content);
    case "html":
      return highlightHTML(content);
    case "css":
      return highlightCSS(content);
    case "markdown":
      // Don't apply syntax highlighting to markdown files for better readability
      return content;
    default:
      return content;
  }
};
