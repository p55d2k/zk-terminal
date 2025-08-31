import { CommandContext } from "../../types";
import { readFile, writeFile } from "../../filesystem";
import { pathJoin } from "../../utils";

export const handleNano = (
  args: string[],
  context: CommandContext
): string => {
  const filePath = args[0];
  if (!filePath) {
    return "error: nano: missing file operand";
  }

  const fullPath = filePath.startsWith("/") ? filePath : pathJoin(context.currentDir, filePath);

  // Check if file exists before opening editor
  const content = readFile(fullPath);
  if (content instanceof Error) {
    return "error: " + content.message;
  }

  // For now, we'll return a message indicating the editor is opening
  // The actual editor UI will be handled by the React component
  return `__OPEN_EDITOR__:${fullPath}:nano`;
};

export const handleVim = (
  args: string[],
  context: CommandContext
): string => {
  const filePath = args[0];
  if (!filePath) {
    return "error: vim: missing file operand";
  }

  const fullPath = filePath.startsWith("/") ? filePath : pathJoin(context.currentDir, filePath);

  // Check if file exists before opening editor
  const content = readFile(fullPath);
  if (content instanceof Error) {
    return "error: " + content.message;
  }

  // For now, we'll return a message indicating the editor is opening
  // The actual editor UI will be handled by the React component
  return `__OPEN_EDITOR__:${fullPath}:vim`;
};
