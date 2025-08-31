export interface Directory {
  name: string;
  type: "directory";
  fullPath: string;
  content: (Directory | File | Symlink)[];
  permissions: string; // e.g., "drwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  modified: Date;
  created: Date;
}

export interface File {
  name: string;
  type: "file";
  fullPath: string;
  content: string;
  permissions: string; // e.g., "-rw-r--r--"
  owner: string;
  group: string;
  size: number;
  modified: Date;
  created: Date;
}

export interface Symlink {
  name: string;
  type: "symlink";
  fullPath: string;
  target: string; // path to the target file/directory
  permissions: string; // e.g., "lrwxrwxrwx"
  owner: string;
  group: string;
  size: number;
  modified: Date;
  created: Date;
}

export type FileSystemItem = Directory | File | Symlink;

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface CommandContext {
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  input?: string;
}
