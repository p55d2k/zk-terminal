// Helper function to join paths correctly
export const pathJoin = (base: string, ...parts: string[]): string => {
  const normalizedBase = base === "/" ? "" : base.replace(/^\/+/, "");
  const normalizedParts = parts.map(p => p.replace(/^\/+/, "")).filter(p => p);
  return "/" + [normalizedBase, ...normalizedParts].join("/");
};

// Helper function to normalize paths
export const normalizePath = (path: string): string => {
  if (path === "/") return "/";
  return (
    "/" +
    path
      .split("/")
      .filter((p) => p)
      .join("/")
  );
};

// Helper function to get parent directory path
export const getParentPath = (path: string): string => {
  if (path === "/") return "/";
  const parts = path.split("/").filter(p => p);
  if (parts.length <= 1) return "/";
  return "/" + parts.slice(0, -1).join("/");
};

// Helper function to get the last part of a path (filename/dirname)
export const getBasename = (path: string): string => {
  if (path === "/") return "/";
  const parts = path.split("/").filter(p => p);
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

  return pathJoin(currentDir, targetPath);
};
