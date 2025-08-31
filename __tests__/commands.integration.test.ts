import { handleLastCommand } from "../lib/handler";
import { Directory, File } from "../lib/types";

describe("Command Integration Tests", () => {
  let currentDir: string;
  let setCurrentDir: jest.Mock;

  beforeEach(() => {
    currentDir = "/";
    setCurrentDir = jest.fn((dir: string) => {
      currentDir = dir;
    });
  });

  describe("Basic Command Flows", () => {
    it("should handle pwd command", async () => {
      const result = await handleLastCommand(
        "pwd",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("/");
    });

    it("should handle cd command", async () => {
      await handleLastCommand("cd home", currentDir, setCurrentDir, true);
      expect(setCurrentDir).toHaveBeenCalledWith("/home");
    });

    it("should handle ls command", async () => {
      const result = await handleLastCommand(
        "ls",
        currentDir,
        setCurrentDir,
        true
      );
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Command Chaining", () => {
    it("should handle sequential commands with ;", async () => {
      const result = await handleLastCommand(
        "pwd ; ls",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toContain("/");
      expect(typeof result).toBe("string");
    });

    it("should handle conditional execution with &&", async () => {
      let testCurrentDir = currentDir;
      const testSetCurrentDir = (dir: string) => {
        testCurrentDir = dir;
        setCurrentDir(dir);
      };

      const result = await handleLastCommand(
        "cd home && ls",
        testCurrentDir,
        testSetCurrentDir,
        true
      );
      expect(typeof result).toBe("string");
      expect(setCurrentDir).toHaveBeenCalledWith("/home");
    });

    it("should handle pipe operations with |", async () => {
      // This test might need adjustment based on actual pipe implementation
      const result = await handleLastCommand(
        'echo "test" | cat',
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toContain("test");
    });
  });

  describe("File Operations", () => {
    it("should handle mkdir command", async () => {
      const result = await handleLastCommand(
        "mkdir testdir",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("");
    });

    it("should handle touch command", async () => {
      const result = await handleLastCommand(
        "touch newfile.txt",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("");
    });

    it("should handle mv command", async () => {
      await handleLastCommand(
        "touch source.txt",
        currentDir,
        setCurrentDir,
        true
      );
      const result = await handleLastCommand(
        "mv source.txt dest.txt",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("");
    });
  });

  describe("Path Resolution", () => {
    it("should handle full path commands", async () => {
      const result = await handleLastCommand(
        "/bin/bash",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toContain("Welcome to zk-terminal");
    });

    it("should handle full path commands with arguments", async () => {
      const result = await handleLastCommand(
        "/bin/bash nonexistent.sh",
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("bash: nonexistent.sh: No such file or directory");
    });

    it("should handle bash -c command execution", async () => {
      const result = await handleLastCommand(
        '/bin/bash -c "echo hello world"',
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("hello world");
    });

    it("should handle bash -c with command substitution", async () => {
      const result = await handleLastCommand(
        '/bin/bash -c "echo $(pwd)"',
        currentDir,
        setCurrentDir,
        true
      );
      expect(result).toBe("/");
    });
  });
});
