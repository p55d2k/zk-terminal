import { CommandContext } from "../../types";
import { listDirectory, changeDirectory } from "../../filesystem";
import { pathJoin } from "../../utils";

export const handleLs = (args: string[], context: CommandContext): string => {
  // Parse arguments for pagination
  let page = 1;
  let pageSize = 50;
  let path = context.currentDir;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--page" && args[i + 1]) {
      page = parseInt(args[i + 1]) || 1;
      i++; // Skip next arg
    } else if (arg === "--page-size" && args[i + 1]) {
      pageSize = parseInt(args[i + 1]) || 50;
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
    .map((item: any) =>
      item.type === "directory" ? item.name + "/" : item.name
    )
    .join(" ");

  // Add pagination info if there are more items
  if (content.length > endIndex) {
    result += `\n... and ${
      content.length - endIndex
    } more items. Use 'ls --page ${page + 1}' to see next page.`;
  }

  if (page > 1 || content.length > pageSize) {
    result += `\nPage ${page} of ${Math.ceil(content.length / pageSize)} (${
      content.length
    } total items)`;
  }

  return result;
};

export const handleCd = (args: string[], context: CommandContext): string => {
  if (args[0].endsWith("/")) {
    args[0] = args[0].slice(0, -1);
  }

  const errorMessage = changeDirectory(
    args[0] || "",
    context.currentDir,
    context.setCurrentDir
  );
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handlePwd = (args: string[], context: CommandContext): string => {
  return context.currentDir;
};
