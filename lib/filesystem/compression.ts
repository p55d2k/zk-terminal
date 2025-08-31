import { Directory, File, FileSystemItem } from "../types";
import { loadData, saveData } from "./storage";
import { getDirectoryFromPath, getContentFromPath } from "./navigation";
import { pathJoin, normalizePath } from "../utils";

// Simple compression using base64 encoding (simulating gzip)
export const compressFile = (filePath: string): Error | "success" => {
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

  const fileObj = file as File;
  // Simple compression simulation using base64
  const compressed = btoa(fileObj.content);
  fileObj.content = compressed;
  fileObj.name = fileObj.name + ".gz";
  fileObj.fullPath = fileObj.fullPath + ".gz";
  fileObj.size = compressed.length;
  fileObj.modified = new Date();

  saveData(data);
  return "success";
};

export const decompressFile = (filePath: string): Error | "success" => {
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

  const fileObj = file as File;
  if (!fileObj.name.endsWith(".gz")) {
    return new Error("file is not compressed");
  }

  try {
    // Simple decompression simulation using base64
    const decompressed = atob(fileObj.content);
    fileObj.content = decompressed;
    fileObj.name = fileObj.name.slice(0, -3); // Remove .gz extension
    fileObj.fullPath = fileObj.fullPath.slice(0, -3);
    fileObj.size = decompressed.length;
    fileObj.modified = new Date();
  } catch (e) {
    return new Error("failed to decompress file");
  }

  saveData(data);
  return "success";
};

// Simple tar-like functionality (archive multiple files)
export const createArchive = (
  archivePath: string,
  sourcePaths: string[],
  currentDir: string
): Error | "success" => {
  const data = loadData();
  const archiveDirs = archivePath.split("/").filter((dir) => dir !== "");
  let current = data;

  for (let i = 0; i < archiveDirs.length - 1; i++) {
    const dir = archiveDirs[i];
    const found = current.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`path not found: ${archivePath}`);
    current = found as Directory;
  }

  const archiveName = archiveDirs[archiveDirs.length - 1];
  const existing = current.content.find((c) => c.name === archiveName);

  if (existing) {
    return new Error(`archive already exists: ${archiveName}`);
  }

  // Collect all files to archive
  const filesToArchive: { path: string; content: string }[] = [];

  for (const sourcePath of sourcePaths) {
    const fullPath = sourcePath.startsWith("/")
      ? sourcePath
      : pathJoin(currentDir, sourcePath);

    const dirs = fullPath.split("/").filter((dir) => dir !== "");
    let srcCurrent = data;

    for (let i = 0; i < dirs.length - 1; i++) {
      const dir = dirs[i];
      const found = srcCurrent.content.find(
        (c) => c.name === dir && c.type === "directory"
      );
      if (!found) return new Error(`source path not found: ${fullPath}`);
      srcCurrent = found as Directory;
    }

    const srcName = dirs[dirs.length - 1];
    const srcItem = srcCurrent.content.find((c) => c.name === srcName);

    if (!srcItem) return new Error(`source not found: ${fullPath}`);

    if (srcItem.type === "file") {
      filesToArchive.push({
        path: fullPath,
        content: (srcItem as File).content,
      });
    } else {
      // For directories, recursively collect all files
      const collectFiles = (dir: Directory, basePath: string): void => {
        for (const item of dir.content) {
          const itemPath = pathJoin(basePath, item.name);
          if (item.type === "file") {
            filesToArchive.push({
              path: itemPath,
              content: (item as File).content,
            });
          } else if (item.type === "directory") {
            collectFiles(item, itemPath);
          }
        }
      };
      collectFiles(srcItem as Directory, fullPath);
    }
  }

  // Create archive content (simple JSON representation)
  const archiveContent = JSON.stringify(filesToArchive, null, 2);
  let fullPath: string;
  try {
    fullPath = normalizePath(archivePath);
  } catch (error) {
    return new Error("Invalid archive path");
  }
  const archiveFile: File = {
    name: archiveName,
    type: "file",
    fullPath,
    content: archiveContent,
    permissions: "-rw-r--r--",
    owner: "user",
    group: "users",
    size: archiveContent.length,
    modified: new Date(),
    created: new Date(),
  };

  current.content.push(archiveFile);
  saveData(data);
  return "success";
};

export const extractArchive = (
  archivePath: string,
  extractPath: string,
  currentDir: string
): Error | "success" => {
  const data = loadData();

  // Find the archive file
  const archiveDirs = archivePath.split("/").filter((dir) => dir !== "");
  let archiveCurrent = data;

  for (let i = 0; i < archiveDirs.length - 1; i++) {
    const dir = archiveDirs[i];
    const found = archiveCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`archive path not found: ${archivePath}`);
    archiveCurrent = found as Directory;
  }

  const archiveName = archiveDirs[archiveDirs.length - 1];
  const archiveFile = archiveCurrent.content.find(
    (c) => c.name === archiveName && c.type === "file"
  );
  if (!archiveFile) return new Error(`archive not found: ${archivePath}`);

  // Find extraction directory
  const extractDirs = extractPath.split("/").filter((dir) => dir !== "");
  let extractCurrent = data;

  for (const dir of extractDirs) {
    const found = extractCurrent.content.find(
      (c) => c.name === dir && c.type === "directory"
    );
    if (!found) return new Error(`extraction path not found: ${extractPath}`);
    extractCurrent = found as Directory;
  }

  try {
    const archiveData = JSON.parse((archiveFile as File).content);

    for (const fileData of archiveData) {
      // Create directories as needed
      const fileDirs: string[] = fileData.path
        .split("/")
        .filter((dir: string) => dir !== "");
      let fileCurrent = extractCurrent;

      for (let i = 1; i < fileDirs.length - 1; i++) {
        const dirName = fileDirs[i];
        let dir = fileCurrent.content.find(
          (c) => c.name === dirName && c.type === "directory"
        ) as Directory;

        if (!dir) {
          dir = {
            name: dirName,
            type: "directory",
            fullPath: pathJoin(fileCurrent.fullPath, dirName),
            content: [],
            permissions: "drwxr-xr-x",
            owner: "user",
            group: "users",
            size: 4096,
            modified: new Date(),
            created: new Date(),
          };
          fileCurrent.content.push(dir);
        }
        fileCurrent = dir;
      }

      const fileName = fileDirs[fileDirs.length - 1];
      const existingFile = fileCurrent.content.find(
        (c) => c.name === fileName && c.type === "file"
      );

      if (existingFile) {
        (existingFile as File).content = fileData.content;
        (existingFile as File).size = fileData.content.length;
        (existingFile as File).modified = new Date();
      } else {
        const newFile: File = {
          name: fileName,
          type: "file",
          fullPath: pathJoin(fileCurrent.fullPath, fileName),
          content: fileData.content,
          permissions: "-rw-r--r--",
          owner: "user",
          group: "users",
          size: fileData.content.length,
          modified: new Date(),
          created: new Date(),
        };
        fileCurrent.content.push(newFile);
      }
    }

    saveData(data);
    return "success";
  } catch (e) {
    return new Error("failed to extract archive");
  }
};
