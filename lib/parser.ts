import { CommandContext, CommandResult } from "./types";
import { commands } from "./commands";
import * as handlers from "./commands/handlers";
import { aliasManager } from "./alias-manager";
import { expandTilde } from "./utils";

export const parseCommand = (
  command: string
): { name: string; args: string[] } => {
  const trimmed = command.trim();
  if (trimmed.startsWith(".")) {
    // Handle . command as source
    const parts = trimmed.split(/\s+/);
    return { name: "source", args: parts.slice(1).map(expandTilde) };
  }
  const parts = trimmed.split(/\s+/);
  let name = parts[0] || "";

  // Extract basename from full paths (e.g., /bin/bash -> bash)
  if (name.includes("/")) {
    const pathParts = name.split("/");
    name = pathParts[pathParts.length - 1];
  }

  const args = parts.slice(1).map(expandTilde);
  return { name, args };
};

export const executeCommand = async (
  command: string,
  context: CommandContext
): Promise<string> => {
  // Expand aliases
  const expandedCommand = aliasManager.expandAlias(command);

  const { name, args } = parseCommand(expandedCommand);

  if (!commands.includes(name)) {
    return `error: command not found: ${name}`;
  }

  // Map command names to handler functions
  const handlerMap: Record<
    string,
    (args: string[], context: CommandContext) => string | Promise<CommandResult>
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
    open: handlers.handleOpen,
    curl: handlers.handleCurl,
    wget: handlers.handleWget,
    api: handlers.handleApi,
    ws: handlers.handleWs,
    jobs: handlers.handleJobs,
    bg: handlers.handleBg,
    fg: handlers.handleFg,
    kill: handlers.handleKill,
    export: handlers.handleExport,
    env: handlers.handleEnv,
    unset: handlers.handleUnset,
    alias: handlers.handleAlias,
    unalias: handlers.handleUnalias,
    source: handlers.handleSource,
    bash: handlers.handleBash,
    ps: handlers.handleJobs,
    which: handlers.handleWhich,
    type: handlers.handleType,
    id: handlers.handleId,
    whoami: handlers.handleWhoami,
    groups: handlers.handleGroups,
    hostname: handlers.handleHostname,
    uname: handlers.handleUname,
    date: handlers.handleDate,
    history: handlers.handleHistory,
  };

  const handler = handlerMap[name];
  if (!handler) {
    return `error: command not implemented yet: ${name}`;
  }

  const result = await handler(args, context);

  // Handle both string and CommandResult returns
  if (typeof result === "string") {
    return result;
  } else {
    return result.success ? result.output : `error: ${result.output}`;
  }
};
