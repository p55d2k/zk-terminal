import {
  pathJoin,
  normalizePath,
  getParentPath,
  getBasename,
  resolvePath,
  expandTilde,
  toDisplayPath,
} from "../lib/utils/index";

describe("Path Utilities", () => {
  describe("pathJoin", () => {
    it("should join paths correctly", () => {
      expect(pathJoin("/home", "user", "docs")).toBe("/home/user/docs");
      expect(pathJoin("/", "test")).toBe("/test");
      expect(pathJoin("/home/", "/user/")).toBe("/home/user");
    });

    it("should handle empty parts", () => {
      expect(pathJoin("/home", "", "docs")).toBe("/home/docs");
      expect(pathJoin("/home", "user", "")).toBe("/home/user");
    });
  });

  describe("normalizePath", () => {
    it("should normalize paths correctly", () => {
      expect(normalizePath("/home/user//docs")).toBe("/home/user/docs");
      expect(normalizePath("/")).toBe("/");
      expect(normalizePath("")).toBe("/");
      expect(normalizePath("home/user")).toBe("/home/user");
    });
  });

  describe("getParentPath", () => {
    it("should get parent directory correctly", () => {
      expect(getParentPath("/home/user/docs")).toBe("/home/user");
      expect(getParentPath("/home")).toBe("/");
      expect(getParentPath("/")).toBe("/");
    });
  });

  describe("getBasename", () => {
    it("should get basename correctly", () => {
      expect(getBasename("/home/user/file.txt")).toBe("file.txt");
      expect(getBasename("/home")).toBe("home");
      expect(getBasename("/")).toBe("/");
    });
  });

  describe("resolvePath", () => {
    it("should resolve absolute paths", () => {
      expect(resolvePath("/home/user", "/etc")).toBe("/etc");
    });

    it("should resolve relative paths", () => {
      expect(resolvePath("/home/user", "docs")).toBe("/home/user/docs");
      expect(resolvePath("/home/user", ".")).toBe("/home/user");
      expect(resolvePath("/home/user", "..")).toBe("/home");
      expect(resolvePath("/home/user", "../other")).toBe("/home/other");
    });
  });

  describe("expandTilde", () => {
    it("should expand tilde to home directory", () => {
      expect(expandTilde("~")).toBe("/home/user");
    });

    it("should expand tilde with path", () => {
      expect(expandTilde("~/Documents")).toBe("/home/user/Documents");
      expect(expandTilde("~/.bashrc")).toBe("/home/user/.bashrc");
      expect(expandTilde("~/bin/script.sh")).toBe("/home/user/bin/script.sh");
    });

    it("should leave non-tilde paths unchanged", () => {
      expect(expandTilde("/etc/passwd")).toBe("/etc/passwd");
      expect(expandTilde("Documents")).toBe("Documents");
      expect(expandTilde("./script.sh")).toBe("./script.sh");
    });
  });

  describe("toDisplayPath", () => {
    it("should convert home directory to tilde", () => {
      expect(toDisplayPath("/home/user")).toBe("~");
    });

    it("should convert home directory paths to tilde notation", () => {
      expect(toDisplayPath("/home/user/Documents")).toBe("~/Documents");
      expect(toDisplayPath("/home/user/.bashrc")).toBe("~/.bashrc");
      expect(toDisplayPath("/home/user/bin/script.sh")).toBe("~/bin/script.sh");
    });

    it("should leave non-home paths unchanged", () => {
      expect(toDisplayPath("/etc/passwd")).toBe("/etc/passwd");
      expect(toDisplayPath("/usr/bin")).toBe("/usr/bin");
      expect(toDisplayPath("/tmp")).toBe("/tmp");
    });
  });
});
