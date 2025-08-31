import { Directory, File, Symlink, FileSystemItem } from "../types";
import { loadData, saveData } from "./storage";
import { getDirectoryFromPath, getContentFromPath } from "./navigation";
import { pathJoin, normalizePath, resolvePath } from "../utils";

const updateDirectoryContent = (
  dirPath: string,
  newContent: FileSystemItem[]
) => {
  const data = loadData();
  const dirs = dirPath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (const dir of dirs) {
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    ) as Directory;
    current = found;
  }

  current.content = newContent;
  saveData(data);
};

const updateFullPaths = (item: FileSystemItem, newBasePath: string) => {
  item.fullPath = newBasePath;
  // Preserve existing dates
  if (!item.modified) item.modified = new Date();
  if (!item.created) item.created = new Date();
  if (item.type === "directory") {
    item.content.forEach((child) => {
      const childPath = pathJoin(newBasePath, child.name);
      updateFullPaths(child, childPath);
    });
  }
};

export const makeDirectory = (
  newDirName: string,
  currentDir: string
): Error | "success" => {
  if (!newDirName) {
    return new Error("missing directory name");
  }

  const dirData = getContentFromPath(currentDir);

  if (dirData instanceof Error) {
    return dirData;
  }

  const foundDir = dirData.find((content) => content.name === newDirName);

  if (foundDir) {
    return new Error(`directory already exists: ${newDirName}`);
  }

  let fullPath: string;
  try {
    fullPath = normalizePath(pathJoin(currentDir, newDirName));
  } catch (error) {
    return new Error("Invalid directory name");
  }

  const newDir: Directory = {
    name: newDirName,
    type: "directory",
    fullPath,
    content: [],
    permissions: "drwxr-xr-x",
    owner: "user",
    group: "users",
    size: 4096,
    modified: new Date(),
    created: new Date(),
  };

  dirData.push(newDir);
  updateDirectoryContent(currentDir, dirData);
  return "success";
};

export const createFile = (
  fileName: string,
  currentDir: string
): Error | "success" => {
  if (!fileName) {
    return new Error("missing file name");
  }

  const dirData = getContentFromPath(currentDir);

  if (dirData instanceof Error) {
    return dirData;
  }

  const foundFile = dirData.find((content) => content.name === fileName);

  if (foundFile) {
    return new Error(`file already exists: ${fileName}`);
  }

  let fullPath: string;
  try {
    fullPath = normalizePath(pathJoin(currentDir, fileName));
  } catch (error) {
    return new Error("Invalid file name");
  }

  const newFile: File = {
    name: fileName,
    type: "file",
    fullPath,
    content: "",
    permissions: "-rw-r--r--",
    owner: "user",
    group: "users",
    size: 0,
    modified: new Date(),
    created: new Date(),
  };

  dirData.push(newFile);
  updateDirectoryContent(currentDir, dirData);
  return "success";
};

export const readFile = (filePath: string): string | Error => {
  const data = loadData();
  const dirs = filePath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < dirs.length - 1; i++) {
    const dir = dirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${filePath}`);
    current = found as Directory;
  }

  const fileName = dirs[dirs.length - 1];
  const file = current.content.find(
    (c) => c.name === fileName && c.type === "file"
  );
  if (!file) return new Error(`file not found: ${filePath}`);

  return (file as File).content;
};

const validateFileContent = (content: string): boolean => {
  // Basic content validation to prevent malicious uploads
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  if (content.length > maxSize) {
    return false;
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return false;
    }
  }

  return true;
};

export const writeFile = (
  filePath: string,
  content: string
): Error | "success" => {
  if (!validateFileContent(content)) {
    return new Error(
      "Invalid file content: potentially malicious or too large"
    );
  }

  const data = loadData();
  const dirs = filePath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < dirs.length - 1; i++) {
    const dir = dirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${filePath}`);
    current = found as Directory;
  }

  const fileName = dirs[dirs.length - 1];
  const file = current.content.find(
    (c) => c.name === fileName && c.type === "file"
  );

  if (file) {
    (file as File).content = content;
    (file as File).size = content.length;
    (file as File).modified = new Date();
  } else {
    let fullPath: string;
    try {
      fullPath = normalizePath(filePath);
    } catch (error) {
      return new Error("Invalid file path");
    }
    current.content.push({
      name: fileName,
      type: "file",
      fullPath,
      content: content,
      permissions: "-rw-r--r--",
      owner: "user",
      group: "users",
      size: content.length,
      modified: new Date(),
      created: new Date(),
    });
  }

  saveData(data);
  return "success";
};

export const writeFileUnsafe = (
  filePath: string,
  content: string
): Error | "success" => {
  // Skip validation for trusted downloads (like wget)
  const data = loadData();
  const dirs = filePath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < dirs.length - 1; i++) {
    const dir = dirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${filePath}`);
    current = found as Directory;
  }

  const fileName = dirs[dirs.length - 1];
  const file = current.content.find(
    (c) => c.name === fileName && c.type === "file"
  );

  if (file) {
    (file as File).content = content;
    (file as File).size = content.length;
    (file as File).modified = new Date();
  } else {
    let fullPath: string;
    try {
      fullPath = normalizePath(filePath);
    } catch (error) {
      return new Error("Invalid file path");
    }
    current.content.push({
      name: fileName,
      type: "file",
      fullPath,
      content: content,
      permissions: "-rw-r--r--",
      owner: "user",
      group: "users",
      size: content.length,
      modified: new Date(),
      created: new Date(),
    });
  }

  saveData(data);
  return "success";
};

export const deleteFile = (
  path: string,
  recursive: boolean = false
): Error | "success" => {
  const data = loadData();
  const dirs = path.split("/").filter((dir) => dir !== "");
  let current = data;
  let parent: Directory | null = null;
  let index = -1;

  for (let i = 0; i < dirs.length - 1; i++) {
    const dir = dirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${path}`);
    parent = current;
    current = found as Directory;
  }

  const name = dirs[dirs.length - 1];
  const item = current.content.find((c, i) => {
    if (c.name === name) {
      index = i;
      return true;
    }
    return false;
  });

  if (!item) return new Error(`item not found: ${path}`);

  if (item.type === "directory") {
    if (!recursive && (item as Directory).content.length > 0) {
      return new Error(
        `directory not empty: ${path}. Use rm -r for recursive deletion.`
      );
    }
  }

  current.content.splice(index, 1);
  saveData(data);
  return "success";
};

export const moveFile = (
  srcPath: string,
  destPath: string
): Error | "success" => {
  const data = loadData();
  const srcDirs = srcPath.split("/").filter((dir) => dir !== "");
  let srcCurrent = data;
  let srcIndex = -1;

  for (let i = 0; i < srcDirs.length - 1; i++) {
    const dir = srcDirs[i];
    const found = srcCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`source path not found: ${srcPath}`);
    srcCurrent = found as Directory;
  }

  const srcName = srcDirs[srcDirs.length - 1];
  const srcItem = srcCurrent.content.find((c, i) => {
    if (c.name === srcName) {
      srcIndex = i;
      return true;
    }
    return false;
  });

  if (!srcItem) return new Error(`source not found: ${srcPath}`);

  // Find dest
  const destDirs = destPath.split("/").filter((dir) => dir !== "");
  let destCurrent = data;
  let destName = destDirs[destDirs.length - 1];

  for (let i = 0; i < destDirs.length - 1; i++) {
    const dir = destDirs[i];
    const found = destCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`destination path not found: ${destPath}`);
    destCurrent = found as Directory;
  }

  // Check if dest exists
  const existing = destCurrent.content.find((c) => c.name === destName);
  if (existing) {
    if (existing.type !== srcItem.type) {
      return new Error(
        `cannot overwrite ${existing.type} with ${srcItem.type}`
      );
    }
    // Overwrite
    if (srcItem.type === "file") {
      (existing as File).content = (srcItem as File).content;
      (existing as File).size = (srcItem as File).size;
      existing.modified = new Date();
    } else {
      (existing as Directory).content = (srcItem as Directory).content;
      existing.modified = new Date();
      // Update fullPaths for the moved content
      (existing as Directory).content.forEach((child) => {
        updateFullPaths(child, pathJoin(existing.fullPath, child.name));
      });
    }
  } else {
    // Move to new name
    srcItem.name = destName;
    let fullPath: string;
    try {
      fullPath = normalizePath(
        destPath.startsWith("/")
          ? destPath
          : pathJoin(destCurrent.fullPath, destName)
      );
    } catch (error) {
      return new Error("Invalid destination path");
    }
    srcItem.fullPath = fullPath;
    // Update fullPaths for the moved item
    updateFullPaths(srcItem, srcItem.fullPath);
    destCurrent.content.push(srcItem);
  }

  // Remove from src
  srcCurrent.content.splice(srcIndex, 1);
  saveData(data);
  return "success";
};

export const copyFile = (
  srcPath: string,
  destPath: string
): Error | "success" => {
  const data = loadData();
  const srcDirs = srcPath.split("/").filter((dir) => dir !== "");
  let srcCurrent = data;

  for (let i = 0; i < srcDirs.length - 1; i++) {
    const dir = srcDirs[i];
    const found = srcCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`source path not found: ${srcPath}`);
    srcCurrent = found as Directory;
  }

  const srcName = srcDirs[srcDirs.length - 1];
  const srcItem = srcCurrent.content.find((c) => c.name === srcName);

  if (!srcItem) return new Error(`source not found: ${srcPath}`);

  // Find dest
  const destDirs = destPath.split("/").filter((dir) => dir !== "");
  let destCurrent = data;
  let destName = destDirs[destDirs.length - 1];

  for (let i = 0; i < destDirs.length - 1; i++) {
    const dir = destDirs[i];
    const found = destCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`destination path not found: ${destPath}`);
    destCurrent = found as Directory;
  }

  const existing = destCurrent.content.find((c) => c.name === destName);
  if (existing) {
    return new Error(`destination already exists: ${destPath}`);
  }

  const copy = JSON.parse(JSON.stringify(srcItem));
  // Restore Date objects after JSON parsing
  const restoreDates = (item: any): any => {
    if (item && typeof item === "object") {
      if (typeof item.modified === "string") {
        item.modified = new Date(item.modified);
      }
      if (typeof item.created === "string") {
        item.created = new Date(item.created);
      }
      if (Array.isArray(item.content)) {
        item.content = item.content.map(restoreDates);
      }
    }
    return item;
  };
  const restoredCopy = restoreDates(copy);
  restoredCopy.name = destName;
  let fullPath: string;
  try {
    fullPath = normalizePath(
      destPath.startsWith("/")
        ? destPath
        : pathJoin(destCurrent.fullPath, destName)
    );
  } catch (error) {
    return new Error("Invalid destination path");
  }
  restoredCopy.fullPath = fullPath;

  // Update fullPaths recursively for the copied item
  updateFullPaths(restoredCopy, restoredCopy.fullPath);

  destCurrent.content.push(restoredCopy);
  saveData(data);
  return "success";
};

export const changePermissions = (
  path: string,
  permissions: string
): Error | "success" => {
  const data = loadData();
  const dirs = path.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < dirs.length - 1; i++) {
    const dir = dirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${path}`);
    current = found as Directory;
  }

  const name = dirs[dirs.length - 1];
  const item = current.content.find((c) => c.name === name);

  if (!item) return new Error(`item not found: ${path}`);

  item.permissions = permissions;
  item.modified = new Date();
  saveData(data);
  return "success";
};

export const createSymlink = (
  linkPath: string,
  targetPath: string
): Error | "success" => {
  const data = loadData();
  const linkDirs = linkPath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < linkDirs.length - 1; i++) {
    const dir = linkDirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${linkPath}`);
    current = found as Directory;
  }

  const linkName = linkDirs[linkDirs.length - 1];
  const existing = current.content.find((c) => c.name === linkName);

  if (existing) {
    return new Error(`file already exists: ${linkName}`);
  }

  let fullPath: string;
  try {
    fullPath = normalizePath(linkPath);
  } catch (error) {
    return new Error("Invalid link path");
  }

  const symlink: Symlink = {
    name: linkName,
    type: "symlink",
    fullPath,
    target: targetPath,
    permissions: "lrwxrwxrwx",
    owner: "user",
    group: "users",
    size: targetPath.length,
    modified: new Date(),
    created: new Date(),
  };

  current.content.push(symlink);
  saveData(data);
  return "success";
};

export const findFiles = (
  startPath: string,
  pattern: string,
  type?: "file" | "directory" | "symlink"
): FileSystemItem[] => {
  const results: FileSystemItem[] = [];
  const data = loadData();
  const dirs = startPath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (const dir of dirs) {
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return results;
    current = found as Directory;
  }

  const searchDirectory = (dir: Directory): void => {
    for (const item of dir.content) {
      if (!type || item.type === type) {
        if (item.name.includes(pattern) || pattern === "*") {
          results.push(item);
        }
      }
      if (item.type === "directory") {
        searchDirectory(item);
      }
    }
  };

  searchDirectory(current);
  return results;
};

export const grepSearch = (
  startPath: string,
  pattern: string,
  caseSensitive: boolean = false
): { file: string; line: number; content: string }[] => {
  const results: { file: string; line: number; content: string }[] = [];
  const data = loadData();
  const dirs = startPath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (const dir of dirs) {
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return results;
    current = found as Directory;
  }

  const searchDirectory = (dir: Directory): void => {
    for (const item of dir.content) {
      if (item.type === "file") {
        const lines = (item as File).content.split("\n");
        lines.forEach((line, index) => {
          const searchLine = caseSensitive ? line : line.toLowerCase();
          const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
          if (searchLine.includes(searchPattern)) {
            results.push({
              file: item.fullPath,
              line: index + 1,
              content: line,
            });
          }
        });
      } else if (item.type === "directory") {
        searchDirectory(item);
      }
    }
  };

  searchDirectory(current);
  return results;
};
