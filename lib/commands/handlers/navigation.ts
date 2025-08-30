import { CommandContext } from "../../types";
import { listDirectory, changeDirectory } from "../../filesystem";

export const handleLs = (args: string[], context: CommandContext): string => {
  return listDirectory(context.currentDir);
};

export const handleCd = (args: string[], context: CommandContext): string => {
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
