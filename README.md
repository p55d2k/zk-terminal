# zk-terminal

A modern, web-based terminal simulator built with Next.js, TypeScript, and Tailwind CSS. Experience a fully functional Unix-like terminal environment directly in your browser with persistent file system storage.

## Features

### Core Terminal Functionality

- **File System Operations**: Create, read, update, and delete files and directories
- **Navigation**: Change directories, list contents, print working directory
- **Text Processing**: Display file contents, echo text, redirect output
- **File Management**: Copy, move, and remove files/directories

### Advanced Features

- **Command Chaining**: Use `;` to execute multiple commands sequentially
- **Conditional Execution**: Use `&&` to run commands only if previous succeeds
- **Piping**: Use `|` to pipe output from one command to another
- **Persistent Storage**: File system state persists in browser's localStorage
- **Command History**: Navigate through previous commands with ↑/↓ arrows
- **Auto-completion**: Tab completion for commands and paths

### Available Commands

- `ls` - List directory contents
- `cd <dir>` - Change directory
- `pwd` - Print working directory
- `cat <file>` - Display file contents
- `echo <text>` - Output text
- `touch <file>` - Create empty file
- `mkdir <dir>` - Create directory
- `rm <path> [-r]` - Remove file or directory
- `mv <src> <dest>` - Move/rename file or directory
- `cp <src> <dest>` - Copy file or directory
- `clear` - Clear screen
- `reset` - Reset filesystem to default state
- `help` - Show available commands

### Special Features

- **Command Operators**:
  - `;` - Command separator (execute all)
  - `&&` - Conditional execution (execute if previous succeeds)
  - `|` - Pipe operator (pass output as input)
- **Redirection**: `echo "text" > file.txt`
- **Recursive Operations**: `rm -r` for directories

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/p55d2k/zk-terminal.git
cd zk-terminal
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Commands

```bash
# Navigate and explore
ls
cd projects
pwd

# Create and manage files
mkdir mydir
cd mydir
echo "Hello World" > hello.txt
cat hello.txt

# Command chaining
mkdir test && cd test && touch file.txt
ls | cat
```

### File System

- All data is stored in your browser's localStorage
- Filesystem persists between sessions
- Use `reset` to restore to default state
- Supports nested directories and files

## Project Structure

```
zk-terminal/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main terminal page
│   └── globals.css     # Global styles
├── lib/                # Core logic (modular architecture)
│   ├── commands/       # Command definitions and handlers
│   │   ├── index.ts    # Command registry
│   │   ├── ls.ts       # List directory command
│   │   ├── cd.ts       # Change directory command
│   │   ├── cat.ts      # Display file contents
│   │   ├── cp.ts       # Copy files/directories
│   │   ├── mv.ts       # Move/rename files
│   │   ├── rm.ts       # Remove files/directories
│   │   ├── mkdir.ts    # Create directories
│   │   ├── touch.ts    # Create files
│   │   ├── echo.ts     # Output text
│   │   ├── pwd.ts      # Print working directory
│   │   └── help.ts     # Show help
│   ├── filesystem/     # Filesystem operations
│   │   ├── index.ts    # Filesystem utilities
│   │   ├── navigation.ts # Directory navigation
│   │   ├── operations.ts # File/directory operations
│   │   └── storage.ts  # localStorage persistence
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts    # Core interfaces
│   ├── utils/          # Utility functions
│   │   └── index.ts    # Path utilities and helpers
│   ├── parser.ts       # Command parsing and chaining
│   └── handler.ts      # Main command processing
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **localStorage** - Client-side data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built as a learning project for terminal simulation
- Inspired by Unix/Linux terminal interfaces
- Uses modern web technologies for cross-platform compatibility
