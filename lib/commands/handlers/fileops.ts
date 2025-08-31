import { CommandContext } from "../../types";
import { makeDirectory, createFile, readFile, writeFile, deleteFile } from "../../filesystem";
import { pathJoin } from "../../utils";
import { getFileType, highlightContent } from "../../utils/syntax-highlighting";

export const handleMkdir = (args: string[], context: CommandContext): string => {
  const errorMessage = makeDirectory(args[0], context.currentDir);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleTouch = (args: string[], context: CommandContext): string => {
  const errorMessage = createFile(args[0], context.currentDir);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleCat = (args: string[], context: CommandContext): string => {
  const filePath = args[0];
  if (!filePath) {
    return context.input || "";
  }
  const fullPath = filePath.startsWith("/") ? filePath : pathJoin(context.currentDir, filePath);
  const content = readFile(fullPath);
  if (content instanceof Error) {
    return "error: " + content.message;
  }

  // Apply syntax highlighting based on file type
  const fileType = getFileType(filePath);
  const highlightedContent = highlightContent(content, fileType);

  return highlightedContent;
};

export const handleRm = (args: string[], context: CommandContext): string => {
  let path: string;
  let recursive = false;
  if (args[0] === "-r") {
    recursive = true;
    path = args[1];
  } else {
    path = args[0];
    recursive = args.includes("-r");
  }
  if (!path) return "error: missing path";
  const fullPath = path.startsWith("/") ? path : pathJoin(context.currentDir, path);
  const errorMessage = deleteFile(fullPath, recursive);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};
