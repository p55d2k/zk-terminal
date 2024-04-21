import { commands } from "./commands";
import { changeDirectory, listDirectory, makeDirectory } from "./data";

export const handleLastCommand = (
  command: string,
  currentDir: string,
  setCurrentDir: (dir: string) => void
): string => {
  const commandName = command.split(" ")[0];
  if (!commands.includes(commandName)) {
    return `error: command not found: ${command}`;
  }

  if (commandName === "pwd") {
    return currentDir;
  } else if (commandName === "echo") {
    return command.slice(5);
  } else if (commandName === "ls") {
    return listDirectory(currentDir);
  } else if (commandName === "cd") {
    const errorMessage = changeDirectory(
      command.split(" ")[1],
      currentDir,
      setCurrentDir
    );
    return errorMessage instanceof Error
      ? "error: " + errorMessage.message
      : "";
  } else if (commandName === "mkdir") {
    const errorMessage = makeDirectory(command.split(" ")[1], currentDir);
    return errorMessage instanceof Error
      ? "error: " + errorMessage.message
      : "";
  } else if (commandName === "clear") {
    return "";
  } else {
    return `error: command not implemented yet: ${commandName}`;
  }
};
