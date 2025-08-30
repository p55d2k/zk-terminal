import { CommandContext } from "./types";
import { commands } from "./commands";
import * as handlers from "./commands/handlers";

export const parseCommand = (command: string): { name: string; args: string[] } => {
  const parts = command.trim().split(/\s+/);
  const name = parts[0] || "";
  const args = parts.slice(1);
  return { name, args };
};

export const executeCommand = (
  command: string,
  context: CommandContext
): string => {
  const { name, args } = parseCommand(command);

  if (!commands.includes(name)) {
    return `error: command not found: ${command}`;
  }

  // Map command names to handler functions
  const handlerMap: Record<string, (args: string[], context: CommandContext) => string> = {
    ls: handlers.handleLs,
    cd: handlers.handleCd,
    pwd: handlers.handlePwd,
    mkdir: handlers.handleMkdir,
    touch: handlers.handleTouch,
    cat: handlers.handleCat,
    rm: handlers.handleRm,
    echo: handlers.handleEcho,
    mv: handlers.handleMv,
    cp: handlers.handleCp,
    clear: handlers.handleClear,
    reset: handlers.handleReset,
    help: handlers.handleHelp,
  };

  const handler = handlerMap[name];
  if (!handler) {
    return `error: command not implemented yet: ${name}`;
  }

  return handler(args, context);
};
