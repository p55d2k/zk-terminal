import { Directory, FileSystemItem } from "../types";
import { loadData, saveData } from "./storage";
import { pathJoin, normalizePath, getParentPath, resolvePath } from "../utils";

export const getDirectoryFromPath = (fullPath: string): Directory | Error => {
  const data = loadData();
  let normalizedPath: string;
  try {
    normalizedPath = normalizePath(fullPath);
  } catch (error) {
    return new Error(`Invalid path: ${fullPath}`);
  }

  if (normalizedPath === "/") {
    return data;
  }

  const dirs = normalizedPath.split("/").filter((dir) => dir !== "");
  let currentDir = data;

  for (const dir of dirs) {
    const foundDir = currentDir.content.find((content) => content.name === dir);

    if (!foundDir) {
      return new Error(`directory not found: ${fullPath}`);
    }

    if (foundDir.type !== "directory") {
      return new Error(`not a directory: ${fullPath}`);
    }

    currentDir = foundDir as Directory;
  }

  return currentDir;
};

export const getContentFromPath = (
  fullPath: string
): FileSystemItem[] | Error => {
  const directory = getDirectoryFromPath(fullPath);

  if (directory instanceof Error) {
    return directory;
  }

  return directory.content;
};

export const listDirectory = (
  currentDir: string,
  page: number = 1,
  pageSize: number = 50
): string => {
  const dirData = getContentFromPath(currentDir);

  if (dirData instanceof Error) {
    return "error: " + dirData.message;
  }

  if (dirData.length === 0) {
    return "Directory is empty.";
  }

  // Implement lazy loading/pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = dirData.slice(startIndex, endIndex);

  let result = paginatedItems
    .map((content) =>
      content.type === "directory" ? content.name + "/" : content.name
    )
    .join(" ");

  // Add pagination info if there are more items
  if (dirData.length > endIndex) {
    result += `\n... and ${
      dirData.length - endIndex
    } more items. Use 'ls --page ${page + 1}' to see next page.`;
  }

  if (page > 1) {
    result += `\nPage ${page} of ${Math.ceil(dirData.length / pageSize)}`;
  }

  return result;
};

export const changeDirectory = (
  newDir: string,
  currentDir: string,
  setCurrentDir: (dir: string) => void
): Error | "success" => {
  if (!newDir || newDir === "/" || newDir === "~" || newDir === "") {
    setCurrentDir("/");
    return "success";
  }

  if (newDir === ".." || newDir === "../") {
    const parentPath = getParentPath(currentDir);
    setCurrentDir(parentPath);
    return "success";
  }

  const resolvedPath = resolvePath(currentDir, newDir);
  const dirData = getContentFromPath(currentDir);

  if (dirData instanceof Error) {
    return dirData;
  }

  const foundDir = dirData.find((content) => content.name === newDir);

  if (!foundDir) {
    return new Error(`directory not found: ${newDir}`);
  }

  if (foundDir.type !== "directory") {
    return new Error(`not a directory: ${newDir}`);
  }

  try {
    setCurrentDir(normalizePath(foundDir.fullPath));
  } catch (error) {
    return new Error("Invalid path");
  }
  return "success";
};
