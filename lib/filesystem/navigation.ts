import { Directory, FileSystemItem } from "../types";
import { loadData, saveData } from "./storage";
import { pathJoin, normalizePath, getParentPath, resolvePath } from "../utils";

export const getDirectoryFromPath = (fullPath: string): Directory | Error => {
  const data = loadData();
  const normalizedPath = normalizePath(fullPath);

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

export const getContentFromPath = (fullPath: string): FileSystemItem[] | Error => {
  const directory = getDirectoryFromPath(fullPath);

  if (directory instanceof Error) {
    return directory;
  }

  return directory.content;
};

export const listDirectory = (currentDir: string): string => {
  const dirData = getContentFromPath(currentDir);

  if (dirData instanceof Error) {
    return "error: " + dirData.message;
  }

  return dirData
    .map((content) =>
      content.type === "directory" ? content.name + "/" : content.name
    )
    .join(" ");
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

  setCurrentDir(normalizePath(foundDir.fullPath));
  return "success";
};
