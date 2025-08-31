// Helper function to join paths correctly
export const pathJoin = (base: string, ...parts: string[]): string => {
  const normalizedBase = base.replace(/^\/+/, "").replace(/\/+$/, "");
  const normalizedParts = parts
    .map((p) => p.replace(/^\/+/, "").replace(/\/+$/, ""))
    .filter((p) => p);
  const result = [normalizedBase, ...normalizedParts]
    .filter((p) => p)
    .join("/");
  return result ? "/" + result : "/";
};

// Helper function to normalize paths
export const normalizePath = (path: string): string => {
  if (path === "/") return "/";

  const parts = path.split("/").filter((p) => p);
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (normalized.length === 0) {
        // Prevent going above root
        throw new Error("Path traversal attempt detected");
      }
      normalized.pop();
    } else if (part === ".") {
      // Skip current directory references
      continue;
    } else if (
      part.includes("..") ||
      part.includes("/") ||
      part.includes("\\")
    ) {
      // Prevent directory traversal in filenames
      throw new Error("Invalid path component");
    } else {
      normalized.push(part);
    }
  }

  return "/" + normalized.join("/");
};

// Helper function to get parent directory path
export const getParentPath = (path: string): string => {
  if (path === "/") return "/";
  const parts = path.split("/").filter((p) => p);
  if (parts.length <= 1) return "/";
  return "/" + parts.slice(0, -1).join("/");
};

// Helper function to get the last part of a path (filename/dirname)
export const getBasename = (path: string): string => {
  if (path === "/") return "/";
  const parts = path.split("/").filter((p) => p);
  return parts[parts.length - 1] || "/";
};

// Helper function to resolve relative paths
export const resolvePath = (currentDir: string, targetPath: string): string => {
  if (targetPath.startsWith("/")) {
    return normalizePath(targetPath);
  }

  if (targetPath === "." || targetPath === "") {
    return currentDir;
  }

  if (targetPath === "..") {
    return getParentPath(currentDir);
  }

  const fullPath = pathJoin(currentDir, targetPath);
  return normalizePath(fullPath);
};

// Additional security function to validate paths
export const validatePath = (path: string): boolean => {
  try {
    normalizePath(path);
    return true;
  } catch {
    return false;
  }
};
