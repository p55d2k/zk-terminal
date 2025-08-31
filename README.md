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
- **Persistent Storage**: File system state persists in browser's IndexedDB
- **Command History**: Navigate through previous commands with ↑/↓ arrows
- **Auto-completion**: Tab completion for commands and paths with fuzzy matching
- **Built-in Text Editor**: `nano` and `vim` style editors with full-screen interface
- **Focus Locking**: Cursor stays locked in terminal input for authentic experience
- **Syntax Highlighting**: Automatic highlighting for 10+ file types in `cat`
- **Command History Search**: Ctrl+R for reverse search through history
- **File Compression**: gzip/gunzip and tar archive support
- **Advanced File Operations**: chmod, ln, find, grep with full Unix compatibility
- **Networking Commands**: curl, wget, api, ws for network operations
- **Job Control**: bg, fg, jobs, kill, ps for process management
- **Environment Variables**: export, env, unset for variable management
- **Command Aliases**: alias, unalias for custom command shortcuts
- **Shell Scripting**: source, bash, . for executing shell scripts
- **Fuzzy Matching**: Intelligent tab completion with fuzzy search

### Security Features

- **Content Security Policy (CSP)**: Strict CSP headers prevent XSS attacks
- **Input Sanitization**: All command inputs are sanitized and validated
- **Path Traversal Protection**: Enhanced path validation prevents directory traversal attacks
- **Rate Limiting**: Command execution is rate-limited to prevent DoS attacks
- **Content Validation**: File content is validated to prevent malicious uploads
- **Dependency Security**: Regular security audits and dependency updates

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

4. Run tests (optional):

```bash
npm run test          # Run unit and integration tests
npm run test:coverage # Run tests with coverage
npm run test:e2e      # Run end-to-end tests
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

### Advanced Usage

```bash
# Text editing
nano README.md    # Open file in nano editor
vim script.js     # Open file in vim editor

# File permissions and links
chmod 755 script.sh
ln -s target link

# Search and find
find "*.js"        # Find all JavaScript files
grep "function" *.js  # Search for text in files

# Compression
gzip large-file.txt
tar -c -f archive.tar *.txt
tar -x -f archive.tar

# Advanced directory listing
ls -l              # Long format with permissions
ls --page 2        # Paginated results
```

### Networking Commands

```bash
# HTTP requests (server-side, bypasses CORS, auto-adds https://)
curl https://api.github.com/users/octocat
curl github.com  # Automatically becomes https://github.com
wget https://example.com/file.txt
wget example.com # Automatically becomes https://example.com

# API interactions (server-side proxy, auto-normalizes URLs)
api GET https://jsonplaceholder.typicode.com/posts/1
api GET jsonplaceholder.typicode.com/posts/1  # Auto-adds https://
api POST https://jsonplaceholder.typicode.com/posts '{"title":"foo","body":"bar","userId":1}'

# WebSocket testing
ws wss://echo.websocket.org
```

### Job Control & Process Management

```bash
# Background job management
sleep 10 &        # Start background job
jobs              # List all jobs
bg %1             # Move job 1 to background
fg %1             # Bring job 1 to foreground
kill %1           # Terminate job 1
ps                # Show process status
```

### Environment Variables & Aliases

```bash
# Environment variables
export MY_VAR="hello world"
echo $MY_VAR      # Outputs: hello world
env               # Show all variables
unset MY_VAR      # Remove variable

# Command aliases
alias ll='ls -l'  # Create alias
ll                # Use alias (same as ls -l)
alias             # Show all aliases
unalias ll        # Remove alias
```

### Shell Scripting

```bash
# Create and execute scripts
echo 'echo "Hello from script!"' > hello.sh
source hello.sh   # Execute script
bash hello.sh     # Same as source
. hello.sh        # Same as source

# Script with variables and commands
cat > script.sh << 'EOF'
#!/bin/bash
echo "Current directory: $PWD"
ls -la
echo "Script completed"
EOF

source script.sh
```

**Note:** `wget` saves downloaded files to the current directory in the virtual filesystem, just like the real wget command. Use `ls` to see downloaded files and `cat` to view their contents.

### File System

- All data is stored in your browser's IndexedDB
- Filesystem persists between sessions
- Use `reset` to restore to default state
- Supports nested directories and files
- Full Unix-style permissions and ownership
- Symbolic links and advanced file operations

## Project Structure

```
zk-terminal/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── networking/ # Networking API routes
│   │       ├── api/    # General API requests
│   │       ├── curl/   # curl command handler
│   │       └── wget/   # wget command handler
│   ├── components/      # React components
│   │   ├── CommandHistory.tsx
│   │   ├── SearchInterface.tsx
│   │   ├── TerminalHeader.tsx
│   │   ├── TerminalInput.tsx
│   │   ├── TextEditor.tsx    # Built-in text editor
│   │   └── ...
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main terminal page
│   └── globals.css     # Global styles
├── lib/                # Core logic (modular architecture)
│   ├── commands/       # Command definitions and handlers
│   │   ├── handlers/   # Command implementations
│   │   │   ├── editor.ts     # Text editor commands
│   │   │   ├── fileops.ts    # File operations
│   │   │   ├── navigation.ts # Navigation commands
│   │   │   ├── utility.ts    # Utility commands
│   │   │   ├── networking.ts # Functional networking commands
│   │   │   ├── advanced.ts   # Job control, env, aliases, scripting
│   │   │   └── ...
│   │   └── index.ts    # Command registry
│   ├── filesystem/     # Filesystem operations
│   │   ├── index.ts    # Filesystem utilities
│   │   ├── navigation.ts # Directory navigation
│   │   ├── operations.ts # File/directory operations
│   │   └── storage.ts  # IndexedDB persistence
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts    # Core interfaces
│   ├── utils/          # Utility functions
│   │   ├── index.ts    # Path utilities and helpers
│   │   ├── fuzzy-match.ts # Fuzzy matching for completion
│   │   └── ...
│   ├── job-manager.ts  # Job control system
│   ├── env-manager.ts  # Environment variables
│   ├── alias-manager.ts # Command aliases
│   ├── script-parser.ts # Shell script execution
│   ├── parser.ts       # Command parsing and chaining
│   └── handler.ts      # Main command processing
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Testing

This project includes comprehensive testing infrastructure to ensure quality and reliability.

### Test Types

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test command flows and interactions between components
- **End-to-End Tests**: Test complete user workflows in the browser

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

### Test Structure

```
__tests__/              # Unit and integration tests
├── utils.test.ts       # Path utility functions
├── commands.integration.test.ts  # Command flow testing
└── components/         # Component tests
    └── TerminalInput.test.tsx

e2e/                    # End-to-end tests
└── terminal.spec.ts    # Browser automation tests
```

### CI/CD

The project includes GitHub Actions workflow for automated testing:

- Runs on every push and pull request
- Tests across multiple Node.js versions (18.x, 20.x)
- Includes unit tests, integration tests, and e2e tests
- Generates test coverage reports
- Deploys to GitHub Pages on main branch

### Test Coverage

Current test coverage includes:

- Utility functions (path operations, validation)
- React components (TerminalInput, form interactions)
- Command parsing and execution
- File system operations
- User interface interactions

### Writing Tests

#### Unit Tests

```typescript
import { pathJoin, normalizePath } from "../lib/utils";

describe("Path Utilities", () => {
  it("should join paths correctly", () => {
    expect(pathJoin("/home", "user", "docs")).toBe("/home/user/docs");
  });
});
```

#### Component Tests

```typescript
import { render, screen } from "@testing-library/react";
import TerminalInput from "./TerminalInput";

it("renders input field", () => {
  render(<TerminalInput {...props} />);
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});
```

#### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test("should execute basic commands", async ({ page }) => {
  await page.goto("/");
  // Test implementation
});
```

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
