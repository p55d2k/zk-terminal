export interface Directory {
  name: string;
  type: "directory";
  fullPath: string;
  content: (Directory | File)[];
}

export interface File {
  name: string;
  type: "file";
  fullPath: string;
  content: string;
}

export type FileSystemItem = Directory | File;

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
