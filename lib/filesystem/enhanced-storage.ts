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
  owner: "root",
  group: "root",
  size: 4096,
  modified: new Date(),
  created: new Date(),
  content: [
    // System directories
    {
      name: "bin",
      type: "directory",
      fullPath: "/bin",
      content: [],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "sbin",
      type: "directory",
      fullPath: "/sbin",
      content: [],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "usr",
      type: "directory",
      fullPath: "/usr",
      content: [
        {
          name: "bin",
          type: "directory",
          fullPath: "/usr/bin",
          content: [],
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "local",
          type: "directory",
          fullPath: "/usr/local",
          content: [
            {
              name: "bin",
              type: "directory",
              fullPath: "/usr/local/bin",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "lib",
              type: "directory",
              fullPath: "/usr/local/lib",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
          ],
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "share",
          type: "directory",
          fullPath: "/usr/share",
          content: [],
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        },
      ],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "etc",
      type: "directory",
      fullPath: "/etc",
      content: [
        {
          name: "passwd",
          type: "file",
          fullPath: "/etc/passwd",
          content: `root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:user:/home/user:/bin/bash`,
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 80,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "group",
          type: "file",
          fullPath: "/etc/group",
          content: `root:x:0:
users:x:100:
user:x:1000:`,
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 40,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "hostname",
          type: "file",
          fullPath: "/etc/hostname",
          content: "zk-terminal",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 12,
          modified: new Date(),
          created: new Date(),
        },
      ],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "var",
      type: "directory",
      fullPath: "/var",
      content: [
        {
          name: "log",
          type: "directory",
          fullPath: "/var/log",
          content: [],
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "tmp",
          type: "directory",
          fullPath: "/var/tmp",
          content: [],
          permissions: "drwxrwxrwt",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        },
      ],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "tmp",
      type: "directory",
      fullPath: "/tmp",
      content: [],
      permissions: "drwxrwxrwt",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "home",
      type: "directory",
      fullPath: "/home",
      content: [
        {
          name: "user",
          type: "directory",
          fullPath: "/home/user",
          content: [
            {
              name: ".bashrc",
              type: "file",
              fullPath: "/home/user/.bashrc",
              content: `# ~/.bashrc - User-specific bash configuration

# Environment variables
export PATH="$HOME/bin:$PATH"
export EDITOR="nano"
export VISUAL="nano"
export PAGER="less"
export HOME="/home/user"

# Aliases
alias ll='ls -l'
alias la='ls -la'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias zk='cd /zk-terminal'

# Functions
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Welcome message
echo "Welcome to zk-terminal!"
echo "Type 'help' for available commands."
echo "Your README is available at: ~/README.md"
echo "Your project is available at: /zk-terminal or ~/zk-terminal"
echo "Use 'zk' alias to navigate to the project quickly."`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 350,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: ".profile",
              type: "file",
              fullPath: "/home/user/.profile",
              content: `# ~/.profile - User environment setup

# Set PATH
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Set locale
export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# Load .bashrc if it exists
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 200,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "README.md",
              type: "file",
              fullPath: "/home/user/README.md",
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

- \`~/README.md\` - This comprehensive guide
- \`/zk-terminal/\` - The complete zk-terminal project
- \`~/zk-terminal\` - Symlink to the project

Try these commands to explore:
\`\`\`bash
ls -la ~
cat ~/README.md | head -20
zk
ls -l
cat README.md
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
mkdir -p my-app/src
cd my-app

# Work with files
echo 'console.log("Hello World");' > src/app.js
cat src/app.js

# Archive your work
tar -c -f backup.tar .
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
              name: "bin",
              type: "directory",
              fullPath: "/home/user/bin",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "user",
              group: "users",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "Documents",
              type: "directory",
              fullPath: "/home/user/Documents",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "user",
              group: "users",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "Downloads",
              type: "directory",
              fullPath: "/home/user/Downloads",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "user",
              group: "users",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "Desktop",
              type: "directory",
              fullPath: "/home/user/Desktop",
              content: [],
              permissions: "drwxr-xr-x",
              owner: "user",
              group: "users",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "zk-terminal",
              type: "symlink",
              fullPath: "/home/user/zk-terminal",
              target: "/zk-terminal",
              permissions: "lrwxrwxrwx",
              owner: "user",
              group: "users",
              size: 12,
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
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "root",
      type: "directory",
      fullPath: "/root",
      content: [],
      permissions: "drwx------",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "dev",
      type: "directory",
      fullPath: "/dev",
      content: [
        {
          name: "null",
          type: "file",
          fullPath: "/dev/null",
          content: "",
          permissions: "crw-rw-rw-",
          owner: "root",
          group: "root",
          size: 0,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "zero",
          type: "file",
          fullPath: "/dev/zero",
          content: "",
          permissions: "crw-rw-rw-",
          owner: "root",
          group: "root",
          size: 0,
          modified: new Date(),
          created: new Date(),
        },
      ],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "proc",
      type: "directory",
      fullPath: "/proc",
      content: [],
      permissions: "dr-xr-xr-x",
      owner: "root",
      group: "root",
      size: 0,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "sys",
      type: "directory",
      fullPath: "/sys",
      content: [],
      permissions: "dr-xr-xr-x",
      owner: "root",
      group: "root",
      size: 0,
      modified: new Date(),
      created: new Date(),
    },
    // User content - include actual project files
    {
      name: "zk-terminal",
      type: "directory",
      fullPath: "/zk-terminal",
      content: [
        {
          name: "README.md",
          type: "file",
          fullPath: "/zk-terminal/README.md",
          content: `# zk-terminal

A modern web-based terminal emulator with persistent filesystem storage.

## Features

- Full Unix-like terminal experience
- Persistent file system with IndexedDB
- Built-in text editors (nano, vim)
- Command history and auto-completion
- Syntax highlighting for multiple languages
- Advanced file operations
- Job control and background processes
- Environment variables and aliases

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\` or \`bun install\`
3. Run the development server: \`npm run dev\` or \`bun run dev\`
4. Open [http://localhost:3000](http://localhost:3000)

## Available Commands

### File Operations
- \`ls, cd, pwd, mkdir, touch, rm, mv, cp\`
- \`chmod, ln, find, grep\`

### Text Editing
- \`nano, vim\`

### System Info
- \`whoami, id, groups, hostname, uname, date\`

### Job Control
- \`jobs, bg, fg, kill, ps\`

### Environment
- \`export, env, unset, alias, unalias\`

### Utilities
- \`clear, help, history\`

## Architecture

Built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- IndexedDB for storage
- Jest for testing`,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: 1200,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "package.json",
          type: "file",
          fullPath: "/zk-terminal/package.json",
          content: `{
  "name": "zk-terminal",
  "version": "2.0.0",
  "description": "A modern web-based terminal emulator",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "3.4.0",
    "@types/node": "20.0.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "typescript": "5.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "playwright": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}`,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: 800,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "tsconfig.json",
          type: "file",
          fullPath: "/zk-terminal/tsconfig.json",
          content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: 600,
          modified: new Date(),
          created: new Date(),
        },
        {
          name: "app",
          type: "directory",
          fullPath: "/zk-terminal/app",
          content: [
            {
              name: "page.tsx",
              type: "file",
              fullPath: "/zk-terminal/app/page.tsx",
              content: `// Main terminal page component
import { Terminal } from '@/components/Terminal';

export default function Home() {
  return <Terminal />;
}`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 150,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "layout.tsx",
              type: "file",
              fullPath: "/zk-terminal/app/layout.tsx",
              content: `// Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 200,
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
        {
          name: "lib",
          type: "directory",
          fullPath: "/zk-terminal/lib",
          content: [
            {
              name: "handler.ts",
              type: "file",
              fullPath: "/zk-terminal/lib/handler.ts",
              content: `// Command handler - processes user input and executes commands`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 100,
              modified: new Date(),
              created: new Date(),
            },
            {
              name: "parser.ts",
              type: "file",
              fullPath: "/zk-terminal/lib/parser.ts",
              content: `// Command parser - parses and executes terminal commands`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 100,
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
        {
          name: "__tests__",
          type: "directory",
          fullPath: "/zk-terminal/__tests__",
          content: [
            {
              name: "commands.integration.test.ts",
              type: "file",
              fullPath: "/zk-terminal/__tests__/commands.integration.test.ts",
              content: `// Integration tests for terminal commands`,
              permissions: "-rw-r--r--",
              owner: "user",
              group: "users",
              size: 100,
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
