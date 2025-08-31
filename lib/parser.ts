import { CommandContext } from "./types";
import { commands } from "./commands";
import * as handlers from "./commands/handlers";

export const parseCommand = (
  command: string
): { name: string; args: string[] } => {
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
  const handlerMap: Record<
    string,
    (args: string[], context: CommandContext) => string
  > = {
    ls: args.includes("-l") ? handlers.handleLsLong : handlers.handleLs,
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
    chmod: handlers.handleChmod,
    ln: handlers.handleLn,
    find: handlers.handleFind,
    grep: handlers.handleGrep,
    gzip: handlers.handleGzip,
    gunzip: handlers.handleGunzip,
    tar: handlers.handleTar,
    nano: handlers.handleNano,
    vim: handlers.handleVim,
  };

  const handler = handlerMap[name];
  if (!handler) {
    return `error: command not implemented yet: ${name}`;
  }

  return handler(args, context);
};
