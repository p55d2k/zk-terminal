import { Directory, File, FileSystemItem } from "../types";
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

  const newDir: Directory = {
    name: newDirName,
    type: "directory",
    fullPath: normalizePath(pathJoin(currentDir, newDirName)),
    content: [],
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

  const newFile: File = {
    name: fileName,
    type: "file",
    fullPath: normalizePath(pathJoin(currentDir, fileName)),
    content: "",
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

export const writeFile = (
  filePath: string,
  content: string
): Error | "success" => {
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
  } else {
    current.content.push({
      name: fileName,
      type: "file",
      fullPath: normalizePath(filePath),
      content: content,
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
    } else {
      (existing as Directory).content = (srcItem as Directory).content;
      // Update fullPaths for the moved content
      (existing as Directory).content.forEach((child) => {
        updateFullPaths(child, pathJoin(existing.fullPath, child.name));
      });
    }
  } else {
    // Move to new name
    srcItem.name = destName;
    srcItem.fullPath = normalizePath(
      destPath.startsWith("/")
        ? destPath
        : pathJoin(destCurrent.fullPath, destName)
    );
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
  copy.name = destName;
  copy.fullPath = normalizePath(
    destPath.startsWith("/")
      ? destPath
      : pathJoin(destCurrent.fullPath, destName)
  );

  // Update fullPaths recursively for the copied item
  updateFullPaths(copy, copy.fullPath);

  destCurrent.content.push(copy);
  saveData(data);
  return "success";
};
