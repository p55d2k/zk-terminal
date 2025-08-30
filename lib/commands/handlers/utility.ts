import { CommandContext } from "../../types";
import { resetData } from "../../filesystem";

export const handleClear = (args: string[], context: CommandContext): string => {
  return "";
};

export const handleReset = (args: string[], context: CommandContext): string => {
  resetData();
  context.setCurrentDir("/");
  return "Data reset to default.";
};

export const handleHelp = (args: string[], context: CommandContext): string => {
  return `Available commands:
ls - list directory contents
cd <dir> - change directory
pwd - print working directory
cat <file> - display file contents
echo <text> - output text
touch <file> - create empty file
mkdir <dir> - create directory
rm <path> [-r] - remove file or directory
mv <src> <dest> - move/rename file or directory
cp <src> <dest> - copy file or directory
clear - clear screen
reset - reset all data to default
help - show this help

Command chaining:
Use ; to separate commands (execute all)
Use && to chain commands (execute next only if previous succeeds)
Use | to pipe output of left command to right command`;
};
