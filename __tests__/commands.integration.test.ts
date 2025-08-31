import { handleLastCommand } from "../lib/handler";
import { Directory, File } from "../lib/types";

// Mock the filesystem storage
jest.mock("../lib/filesystem/storage", () => ({
  loadData: jest.fn(),
  saveData: jest.fn(),
  resetData: jest.fn(),
}));

import { loadData, saveData, resetData } from "../lib/filesystem/storage";

describe("Command Integration Tests", () => {
  let mockFilesystem: Directory;
  let currentDir: string;
  let setCurrentDir: jest.Mock;

  beforeEach(() => {
    // Create a mock filesystem
    mockFilesystem = {
      name: "",
      type: "directory",
      fullPath: "/",
      content: [
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
                  name: "test.txt",
                  type: "file",
                  fullPath: "/home/user/test.txt",
                  content: "Hello World",
                  permissions: "-rw-r--r--",
                  owner: "user",
                  group: "user",
                  size: 11,
                  modified: new Date(),
                  created: new Date(),
                } as File,
              ],
              permissions: "drwxr-xr-x",
              owner: "user",
              group: "user",
              size: 4096,
              modified: new Date(),
              created: new Date(),
            } as Directory,
          ],
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          modified: new Date(),
          created: new Date(),
        } as Directory,
      ],
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    };

    currentDir = "/";
    setCurrentDir = jest.fn((dir: string) => {
      currentDir = dir;
    });

    // Mock the storage functions
    (loadData as jest.Mock).mockReturnValue(mockFilesystem);
    (saveData as jest.Mock).mockImplementation(() => {});
    (resetData as jest.Mock).mockReturnValue(mockFilesystem);
  });

  describe("Basic Command Flows", () => {
    it("should handle pwd command", () => {
      const result = handleLastCommand("pwd", currentDir, setCurrentDir, true);
      expect(result).toBe("/");
    });

    it("should handle cd command", () => {
      handleLastCommand("cd home", currentDir, setCurrentDir, true);
      expect(setCurrentDir).toHaveBeenCalledWith("/home");
    });

    it("should handle ls command", () => {
      const result = handleLastCommand("ls", currentDir, setCurrentDir, true);
      expect(result).toContain("home");
    });

    it("should handle cat command", () => {
      handleLastCommand("cd home/user", currentDir, setCurrentDir, true);
      const result = handleLastCommand(
        "cat test.txt",
        "/home/user",
        setCurrentDir,
        true
      );
      expect(result).toBe("Hello World");
    });
  });

  describe("Command Chaining", () => {
    it("should handle sequential commands with ;", () => {
      const result = handleLastCommand(
        "pwd ; ls",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toContain("/");
      expect(result).toContain("home/");
    });

    it("should handle conditional execution with &&", () => {
      let testCurrentDir = currentDir;
      const testSetCurrentDir = (dir: string) => {
        testCurrentDir = dir;
        setCurrentDir(dir);
      };

      const result = handleLastCommand(
        "cd home && ls",
        testCurrentDir,
        testSetCurrentDir,
        true
      );
      expect(result).toContain("user/");
      expect(setCurrentDir).toHaveBeenCalledWith("/home");
    });

    it("should handle pipe operations with |", () => {
      // This test might need adjustment based on actual pipe implementation
      const result = handleLastCommand(
        'echo "test" | cat',
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toContain("test");
    });
  });

  describe("File Operations", () => {
    it("should handle mkdir and navigation", () => {
      handleLastCommand("mkdir testdir", currentDir, setCurrentDir, true);
      const result = handleLastCommand("ls", currentDir, setCurrentDir, true);
      expect(result).toContain("testdir");
    });

    it("should handle touch and file creation", () => {
      handleLastCommand("touch newfile.txt", currentDir, setCurrentDir, true);
      const result = handleLastCommand("ls", currentDir, setCurrentDir, true);
      expect(result).toContain("newfile.txt");
    });

    it("should handle mv command", () => {
      handleLastCommand("touch source.txt", currentDir, setCurrentDir, true);
      handleLastCommand(
        "mv source.txt dest.txt",
        currentDir,
        setCurrentDir,
        true
      );
      const result = handleLastCommand("ls", currentDir, setCurrentDir, true);
      expect(result).toContain("dest.txt");
      expect(result).not.toContain("source.txt");
    });
  });
});
