import { CommandContext } from "../../types";
import { writeFile, moveFile, copyFile } from "../../filesystem";
import { pathJoin } from "../../utils";

export const handleEcho = (args: string[], context: CommandContext): string => {
  const redirectIndex = args.indexOf(">");
  if (redirectIndex !== -1 && redirectIndex < args.length - 1) {
    // Handle redirection
    const textParts = args.slice(0, redirectIndex);
    let text = textParts.join(" ");
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }
    const file = args[redirectIndex + 1];
    const filePath = file.startsWith("/") ? file : pathJoin(context.currentDir, file);
    const errorMessage = writeFile(filePath, text);
    return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
  } else {
    // Normal echo
    return args.join(" ");
  }
};

export const handleMv = (args: string[], context: CommandContext): string => {
  const src = args[0];
  const dest = args[1];
  if (!src || !dest) return "error: missing source or destination";
  const srcPath = src.startsWith("/") ? src : pathJoin(context.currentDir, src);
  const destPath = dest.startsWith("/") ? dest : pathJoin(context.currentDir, dest);
  const errorMessage = moveFile(srcPath, destPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleCp = (args: string[], context: CommandContext): string => {
  const src = args[0];
  const dest = args[1];
  if (!src || !dest) return "error: missing source or destination";
  const srcPath = src.startsWith("/") ? src : pathJoin(context.currentDir, src);
  const destPath = dest.startsWith("/") ? dest : pathJoin(context.currentDir, dest);
  const errorMessage = copyFile(srcPath, destPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};
