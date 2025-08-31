import { Directory } from "../types";

// Compression utilities using built-in compression
export const compressData = (data: string): string => {
  // Simple base64 encoding for compression (in real app, use proper compression)
  try {
    return btoa(data);
  } catch {
    return data;
  }
};

export const decompressData = (data: string): string => {
  try {
    return atob(data);
  } catch {
    return data;
  }
};

// Caching layer
class FileCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const fileCache = new FileCache();

// Enhanced storage with compression and caching
export const loadDataWithCache = (): Directory => {
  if (typeof window === "undefined") {
    return defaultData;
  }

  // Check cache first
  const cached = fileCache.get("filesystem");
  if (cached) {
    return cached;
  }

  const data = localStorage.getItem("data");
  if (!data) {
    const dataToStore = JSON.stringify(defaultData);
    const compressed = compressData(dataToStore);
    localStorage.setItem("data", compressed);
    fileCache.set("filesystem", defaultData);
    return defaultData;
  }

  try {
    const decompressed = decompressData(data);
    const parsed = JSON.parse(decompressed);
    const revived = reviveDates(parsed);
    fileCache.set("filesystem", revived);
    return revived;
  } catch {
    const dataToStore = JSON.stringify(defaultData);
    const compressed = compressData(dataToStore);
    localStorage.setItem("data", compressed);
    fileCache.set("filesystem", defaultData);
    return defaultData;
  }
};

export const saveDataWithCache = (data: Directory): void => {
  if (typeof window !== "undefined") {
    const dataToStore = JSON.stringify(data);
    const compressed = compressData(dataToStore);
    localStorage.setItem("data", compressed);
    fileCache.set("filesystem", data);
  }
};

export const resetDataWithCache = (): Directory => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("data");
    fileCache.clear();
  }
  return defaultData;
};

// Keep original functions for backward compatibility
export const defaultData: Directory = {
  name: "/",
  type: "directory",
  fullPath: "/",
  permissions: "drwxr-xr-x",
  owner: "user",
  group: "users",
  size: 4096,
  modified: new Date(),
  created: new Date(),
  content: [
    {
      name: "README.md",
      type: "file",
      fullPath: "/README.md",
      content: `# Welcome to zk-terminal v2.0

## About zk-terminal

zk-terminal is a modern, web-based terminal emulator built with Next.js, TypeScript, and Tailwind CSS. Experience a fully functional Unix-like terminal environment directly in your browser with persistent file system storage.

## 🚀 Quick Start

You're already here! This terminal provides a complete Unix-like environment with:

- **File System**: Full directory structure with persistent storage
- **Text Editor**: Built-in nano and vim editors
- **Command History**: Navigate with ↑/↓ arrows
- **Auto-completion**: Tab completion for commands and paths
- **Focus Locking**: Cursor stays in terminal for authentic experience

## 📁 File System

Your files are stored in the browser and persist between sessions. The filesystem includes:

- Root directory (/) with basic structure
- Projects folder for organizing your work
- Full Unix-style permissions and ownership
- Support for nested directories and files

### Demo Files

Check out these example files to get started:

- \`/README.md\` - This comprehensive guide
- \`/projects/example.js\` - Sample JavaScript file with code examples
- \`/projects/demo.txt\` - Text file demonstrating various features

Try these commands to explore:
\`\`\`bash
ls -la /
cat /README.md | head -20
cd projects
ls -l
cat example.js
nano demo.txt
\`\`\`

## 🛠️ Available Commands

### File Operations
- \`ls [path] [--page N] [--page-size N]\` - List directory contents
- \`cd <dir>\` - Change directory
- \`pwd\` - Print working directory
- \`cat <file>\` - Display file contents with syntax highlighting
- \`touch <file>\` - Create empty file
- \`mkdir <dir>\` - Create directory
- \`rm <path> [-r]\` - Remove file or directory
- \`mv <src> <dest>\` - Move/rename file or directory
- \`cp <src> <dest>\` - Copy file or directory

### Advanced Operations
- \`chmod <perm> <path>\` - Change file permissions
- \`ln <target> <link>\` - Create symbolic link
- \`find <pattern> [path]\` - Search for files
- \`grep <pattern> [path] [-i]\` - Search text in files
- \`gzip <file>\` - Compress file
- \`gunzip <file>\` - Decompress file
- \`tar -c -f <archive> <files...>\` - Create archive
- \`tar -x -f <archive> [dest]\` - Extract archive

### Text Editing
- \`nano <file>\` - Edit file with nano-style editor
- \`vim <file>\` - Edit file with vim-style editor

### Utilities
- \`clear\` - Clear screen
- \`reset\` - Reset filesystem to default state
- \`help\` - Show available commands
- \`help <category>\` - Show help for specific category

## ⌨️ Keyboard Shortcuts

### Terminal Navigation
- \`↑/↓\` - Navigate command history
- \`Tab\` - Auto-complete commands and paths
- \`Ctrl+R\` - Reverse search through history
- \`Ctrl+L\` - Clear screen
- \`Ctrl+D\` - Exit terminal

### Editor Shortcuts
- **Nano**: \`Ctrl+X\` (save), \`Ctrl+C\` (exit)
- **Vim**: \`Esc\` (command mode), \`:q\` (quit), \`:wq\` (save & quit)

## 🔧 Advanced Features

### Command Chaining
\`\`\`bash
mkdir test && cd test && touch file.txt
ls | cat
echo "Hello" > file.txt && cat file.txt
\`\`\`

### Text Editing
\`\`\`bash
# Create and edit a file
touch hello.js
nano hello.js

# Or use vim
vim script.py
\`\`\`

### File Management
\`\`\`bash
# Create project structure
mkdir -p projects/my-app/src
cd projects/my-app

# Work with files
echo 'console.log("Hello World");' > src/app.js
cat src/app.js

# Archive your work
tar -c -f backup.tar projects/
gzip backup.tar
\`\`\`

## 💡 Tips & Tricks

1. **Focus Management**: The cursor automatically stays in the terminal - no need to click to focus
2. **Command History**: Use ↑/↓ to navigate through previous commands
3. **Auto-completion**: Press Tab to complete commands, file names, and paths
4. **Syntax Highlighting**: Files opened with \`cat\` show syntax highlighting for many languages
5. **Persistent Storage**: Your files remain even after closing the browser
6. **Reset Option**: Use \`reset\` to restore the filesystem to its initial state

## 🎯 Getting Help

- \`help\` - Overview of all command categories
- \`help fileops\` - File operation commands
- \`help search\` - Search and utility commands
- \`help shortcuts\` - Keyboard shortcuts
- \`help features\` - Advanced features

## 🔄 What's New in v2.0

- ✅ Built-in text editors (nano & vim)
- ✅ Focus locking for authentic terminal experience
- ✅ Enhanced command history with search
- ✅ Syntax highlighting for 10+ file types
- ✅ Advanced file operations (permissions, links, compression)
- ✅ Improved performance with caching and lazy loading
- ✅ Comprehensive help system with categories

## 🌟 Pro Tips

- Use \`ls -l\` for detailed file information
- Combine commands with \`&&\` and \`|\` for powerful workflows
- The terminal remembers your command history across sessions
- Files are compressed and cached for better performance
- Use \`find\` and \`grep\` for powerful file and text search

---

**Enjoy using zk-terminal!** 🚀

*Built with Next.js, TypeScript, and Tailwind CSS*`,
      permissions: "-rw-r--r--",
      owner: "user",
      group: "users",
      size: 4500,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "projects",
      type: "directory",
      fullPath: "/projects",
      content: [
        {
          name: "example.js",
          type: "file",
          fullPath: "/projects/example.js",
          content: `// Welcome to zk-terminal!
// This is a sample JavaScript file to demonstrate the terminal's capabilities

function greet(name) {
  console.log(\`Hello, \${name}! Welcome to zk-terminal v2.0\`);
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example usage
greet("Developer");
console.log("Fibonacci of 10:", fibonacci(10));

// Try editing this file with: nano /projects/example.js
// Or view it with: cat /projects/example.js`,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: 380,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "demo.txt",
          type: "file",
          fullPath: "/projects/demo.txt",
          content: `zk-terminal Demo File
====================

This file demonstrates various features of zk-terminal:

1. File Operations:
   - ls, cd, pwd, mkdir, touch
   - cp, mv, rm with recursive support

2. Text Processing:
   - cat with syntax highlighting
   - grep for text search
   - find for file search

3. Advanced Features:
   - chmod for permissions
   - ln for symbolic links
   - gzip/gunzip for compression
   - tar for archiving

4. Text Editing:
   - nano for simple editing
   - vim for advanced editing

Try these commands:
- cat /projects/demo.txt
- nano /projects/demo.txt
- grep "terminal" /projects/demo.txt
- ls -l /projects/

Happy exploring! 🚀`,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: 650,
          modified: new Date(),
          created: new Date(),
        },
      ],
      permissions: "drwxr-xr-x",
      owner: "user",
      group: "users",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
  ],
};

// Function to recursively convert date strings back to Date objects
export const reviveDates = (item: any): any => {
  if (item && typeof item === "object") {
    // Convert date strings to Date objects
    if (typeof item.modified === "string") {
      item.modified = new Date(item.modified);
    }
    if (typeof item.created === "string") {
      item.created = new Date(item.created);
    }

    // Recursively process content array
    if (Array.isArray(item.content)) {
      item.content = item.content.map(reviveDates);
    }
  }
  return item;
};

export const loadData = (): Directory => {
  return loadDataWithCache();
};

export const saveData = (data: Directory): void => {
  saveDataWithCache(data);
};

export const resetData = (): Directory => {
  return resetDataWithCache();
};
