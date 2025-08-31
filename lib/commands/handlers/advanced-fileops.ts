import { CommandContext, FileSystemItem } from "../../types";
import {
  changePermissions,
  createSymlink,
  findFiles,
  grepSearch,
} from "../../filesystem";
import {
  compressFile,
  decompressFile,
  createArchive,
  extractArchive,
} from "../../filesystem/compression";
import { pathJoin } from "../../utils";
import { getContentFromPath } from "../../filesystem/navigation";

export const handleChmod = (
  args: string[],
  context: CommandContext
): string => {
  const permissions = args[0];
  const path = args[1];

  if (!permissions || !path) {
    return "error: usage: chmod <permissions> <path>";
  }

  // Basic validation for permissions format
  if (!/^[-dlrwxstugo]{9,10}$/.test(permissions)) {
    return "error: invalid permissions format. Use format like 'rw-r--r--' or 'drwxr-xr-x'";
  }

  const fullPath = path.startsWith("/")
    ? path
    : pathJoin(context.currentDir, path);
  const errorMessage = changePermissions(fullPath, permissions);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleLn = (args: string[], context: CommandContext): string => {
  const target = args[0];
  const linkName = args[1];

  if (!target || !linkName) {
    return "error: usage: ln <target> <link_name>";
  }

  const targetPath = target.startsWith("/")
    ? target
    : pathJoin(context.currentDir, target);
  const linkPath = linkName.startsWith("/")
    ? linkName
    : pathJoin(context.currentDir, linkName);

  const errorMessage = createSymlink(linkPath, targetPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleFind = (args: string[], context: CommandContext): string => {
  const pattern = args[0] || "*";
  const type = args[1] as "file" | "directory" | "symlink" | undefined;
  const startPath = args[2] || context.currentDir;

  const fullPath = startPath.startsWith("/")
    ? startPath
    : pathJoin(context.currentDir, startPath);
  const results = findFiles(fullPath, pattern, type);

  if (results.length === 0) {
    return "No files found matching the criteria.";
  }

  return results
    .map(
      (item) =>
        `${item.permissions} ${item.owner} ${item.group} ${item.size} ${
          item.modified.toISOString().split("T")[0]
        } ${item.fullPath}`
    )
    .join("\n");
};

export const handleGrep = (args: string[], context: CommandContext): string => {
  const pattern = args[0];
  const path = args[1] || context.currentDir;
  const caseSensitive = args.includes("-i") ? false : true;

  if (!pattern) {
    return "error: usage: grep <pattern> [path] [-i for case insensitive]";
  }

  const fullPath = path.startsWith("/")
    ? path
    : pathJoin(context.currentDir, path);
  const results = grepSearch(fullPath, pattern, caseSensitive);

  if (results.length === 0) {
    return "No matches found.";
  }

  return results
    .map((result) => `${result.file}:${result.line}:${result.content}`)
    .join("\n");
};

export const handleLsLong = (
  args: string[],
  context: CommandContext
): string => {
  // Parse arguments for pagination
  let page = 1;
  let pageSize = 20; // Smaller page size for long listing
  let path = context.currentDir;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--page" && args[i + 1]) {
      page = parseInt(args[i + 1]) || 1;
      i++; // Skip next arg
    } else if (arg === "--page-size" && args[i + 1]) {
      pageSize = parseInt(args[i + 1]) || 20;
      i++; // Skip next arg
    } else if (!arg.startsWith("-")) {
      path = arg;
    }
  }

  const fullPath = path.startsWith("/")
    ? path
    : pathJoin(context.currentDir, path);

  const { getContentFromPath } = require("../../filesystem/navigation");
  const content = getContentFromPath(fullPath);

  if (content instanceof Error) {
    return "error: " + content.message;
  }

  if (content.length === 0) {
    return "Directory is empty.";
  }

  // Implement lazy loading/pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = content.slice(startIndex, endIndex);

  let result = paginatedItems
    .map(
      (item: FileSystemItem) =>
        `${item.permissions} ${item.owner} ${item.group} ${item.size} ${
          item.modified.toISOString().split("T")[0]
        } ${item.name}`
    )
    .join("\n");

  // Add pagination info if there are more items
  if (content.length > endIndex) {
    result += `\n... and ${
      content.length - endIndex
    } more items. Use 'ls -l --page ${page + 1}' to see next page.`;
  }

  if (page > 1 || content.length > pageSize) {
    result += `\nPage ${page} of ${Math.ceil(content.length / pageSize)} (${
      content.length
    } total items)`;
  }

  return result;
};

export const handleGzip = (args: string[], context: CommandContext): string => {
  const filePath = args[0];

  if (!filePath) {
    return "error: usage: gzip <file>";
  }

  const fullPath = filePath.startsWith("/")
    ? filePath
    : pathJoin(context.currentDir, filePath);
  const errorMessage = compressFile(fullPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleGunzip = (
  args: string[],
  context: CommandContext
): string => {
  const filePath = args[0];

  if (!filePath) {
    return "error: usage: gunzip <file>";
  }

  const fullPath = filePath.startsWith("/")
    ? filePath
    : pathJoin(context.currentDir, filePath);
  const errorMessage = decompressFile(fullPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleTar = (args: string[], context: CommandContext): string => {
  const createIndex = args.indexOf("-c");
  const extractIndex = args.indexOf("-x");
  const fileIndex = args.indexOf("-f");

  if (createIndex !== -1 && fileIndex !== -1 && fileIndex > createIndex) {
    // Create archive
    const archiveName = args[fileIndex + 1];
    const sourceFiles = args.slice(fileIndex + 2);

    if (!archiveName || sourceFiles.length === 0) {
      return "error: usage: tar -c -f <archive> <files...>";
    }

    const fullArchivePath = archiveName.startsWith("/")
      ? archiveName
      : pathJoin(context.currentDir, archiveName);

    const errorMessage = createArchive(
      fullArchivePath,
      sourceFiles,
      context.currentDir
    );
    return errorMessage instanceof Error
      ? "error: " + errorMessage.message
      : "";
  } else if (
    extractIndex !== -1 &&
    fileIndex !== -1 &&
    fileIndex > extractIndex
  ) {
    // Extract archive
    const archiveName = args[fileIndex + 1];
    const extractPath = args[fileIndex + 2] || context.currentDir;

    if (!archiveName) {
      return "error: usage: tar -x -f <archive> [destination]";
    }

    const fullArchivePath = archiveName.startsWith("/")
      ? archiveName
      : pathJoin(context.currentDir, archiveName);

    const fullExtractPath = extractPath.startsWith("/")
      ? extractPath
      : pathJoin(context.currentDir, extractPath);

    const errorMessage = extractArchive(
      fullArchivePath,
      fullExtractPath,
      context.currentDir
    );
    return errorMessage instanceof Error
      ? "error: " + errorMessage.message
      : "";
  } else {
    return "error: usage: tar -c -f <archive> <files...> | tar -x -f <archive> [destination]";
  }
};
