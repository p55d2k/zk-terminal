import { CommandContext } from "../../types";
import { writeFile, moveFile, copyFile, readFile } from "../../filesystem";
import { pathJoin } from "../../utils";
import { jobManager } from "../../job-manager";
import { envManager } from "../../env-manager";
import { aliasManager } from "../../alias-manager";
import { scriptParser } from "../../script-parser";
import { executeCommand } from "../../parser";

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
    const filePath = file.startsWith("/")
      ? file
      : pathJoin(context.currentDir, file);
    const errorMessage = writeFile(filePath, text);
    return errorMessage instanceof Error
      ? "error: " + errorMessage.message
      : "";
  } else {
    // Normal echo
    return args.join(" ");
  }
};

export const handleMv = (args: string[], context: CommandContext): string => {
  // Parse arguments, skipping flags
  let src = "";
  let dest = "";
  let interactive = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-i" || arg === "--interactive") {
      interactive = true;
    } else if (!src) {
      src = arg;
    } else if (!dest) {
      dest = arg;
    }
  }

  if (!src || !dest) return "error: missing source or destination";
  const srcPath = src.startsWith("/") ? src : pathJoin(context.currentDir, src);
  const destPath = dest.startsWith("/")
    ? dest
    : pathJoin(context.currentDir, dest);
  const errorMessage = moveFile(srcPath, destPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

export const handleCp = (args: string[], context: CommandContext): string => {
  // Parse arguments, skipping flags
  let src = "";
  let dest = "";
  let interactive = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-i" || arg === "--interactive") {
      interactive = true;
    } else if (!src) {
      src = arg;
    } else if (!dest) {
      dest = arg;
    }
  }

  if (!src || !dest) return "error: missing source or destination";
  const srcPath = src.startsWith("/") ? src : pathJoin(context.currentDir, src);
  const destPath = dest.startsWith("/")
    ? dest
    : pathJoin(context.currentDir, dest);
  const errorMessage = copyFile(srcPath, destPath);
  return errorMessage instanceof Error ? "error: " + errorMessage.message : "";
};

// Job control commands
export const handleJobs = (args: string[], context: CommandContext): string => {
  const jobs = jobManager.getAllJobs();
  if (jobs.length === 0) {
    return "No jobs";
  }

  const output = jobs
    .map((job) => {
      const status =
        job.status === "running"
          ? "Running"
          : job.status === "stopped"
          ? "Stopped"
          : job.status === "completed"
          ? "Done"
          : "Terminated";
      const bg = job.background ? "&" : "";
      return `[${job.id}] ${status} ${job.command} ${bg}`;
    })
    .join("\n");

  return output;
};

export const handleBg = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    return "error: job ID required";
  }

  const jobId = parseInt(args[0]);
  if (isNaN(jobId)) {
    return "error: invalid job ID";
  }

  const job = jobManager.getJob(jobId);
  if (!job) {
    return `error: job ${jobId} not found`;
  }

  if (job.status !== "stopped") {
    return `error: job ${jobId} is not stopped`;
  }

  jobManager.updateJobStatus(jobId, "running");
  job.background = true;
  return `[${jobId}] ${job.command} &`;
};

export const handleFg = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    return "error: job ID required";
  }

  const jobId = parseInt(args[0]);
  if (isNaN(jobId)) {
    return "error: invalid job ID";
  }

  const job = jobManager.getJob(jobId);
  if (!job) {
    return `error: job ${jobId} not found`;
  }

  if (job.status !== "running") {
    return `error: job ${jobId} is not running`;
  }

  job.background = false;
  return job.command;
};

export const handleKill = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    return "error: job ID or PID required";
  }

  const target = args[0];
  let success = false;

  if (target.startsWith("%")) {
    // Job ID
    const jobId = parseInt(target.slice(1));
    if (!isNaN(jobId)) {
      success = jobManager.killJob(jobId);
      if (success) {
        return `Job ${jobId} terminated`;
      }
    }
  } else {
    // PID
    const pid = parseInt(target);
    if (!isNaN(pid)) {
      success = jobManager.killJobByPid(pid);
      if (success) {
        return `Process ${pid} terminated`;
      }
    }
  }

  return "error: job or process not found";
};

// Environment variable commands
export const handleExport = (
  args: string[],
  context: CommandContext
): string => {
  if (args.length === 0) {
    // Show all environment variables
    const vars = envManager.getAllVariables();
    return vars.map((v) => `export ${v.name}="${v.value}"`).join("\n");
  }

  const arg = args.join(" ");
  const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (match) {
    const [, name, value] = match;
    envManager.setVariable(name, value);
    return "";
  }

  return "error: invalid export syntax. Use: export VAR=value";
};

export const handleEnv = (args: string[], context: CommandContext): string => {
  if (args.length === 0) {
    // Show all environment variables
    const vars = envManager.getAllVariables();
    return vars.map((v) => `${v.name}=${v.value}`).join("\n");
  }

  const name = args[0];
  if (args.length === 1) {
    // Get specific variable
    const value = envManager.getVariable(name);
    return value !== undefined
      ? `${name}=${value}`
      : `error: ${name} not found`;
  } else {
    // Set variable
    const value = args.slice(1).join(" ");
    envManager.setVariable(name, value);
    return "";
  }
};

export const handleUnset = (
  args: string[],
  context: CommandContext
): string => {
  if (args.length === 0) {
    return "error: variable name required";
  }

  const name = args[0];
  const success = envManager.unsetVariable(name);
  return success ? "" : `error: ${name} not found`;
};

// Alias commands
export const handleAlias = (
  args: string[],
  context: CommandContext
): string => {
  if (args.length === 0) {
    // List all aliases
    return aliasManager.listAliases();
  }

  const arg = args.join(" ");
  const match = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.+)$/);
  if (match) {
    const [, name, command] = match;
    aliasManager.setAlias(name, command);
    return "";
  }

  // Get specific alias
  const alias = aliasManager.getAlias(args[0]);
  if (alias) {
    return `alias ${args[0]}='${alias}'`;
  }

  return `error: alias ${args[0]} not found`;
};

export const handleUnalias = (
  args: string[],
  context: CommandContext
): string => {
  if (args.length === 0) {
    return "error: alias name required";
  }

  const name = args[0];
  const success = aliasManager.removeAlias(name);
  return success ? "" : `error: alias ${name} not found`;
};

// Shell scripting commands
export const handleSource = (
  args: string[],
  context: CommandContext
): string => {
  if (args.length === 0) {
    return "error: script file required";
  }

  const scriptPath = args[0].startsWith("/")
    ? args[0]
    : pathJoin(context.currentDir, args[0]);
  const fileContent = readFile(scriptPath);

  if (fileContent instanceof Error) {
    return `error: ${fileContent.message}`;
  }

  if (typeof fileContent === "string") {
    const lines = scriptParser.parseScript(fileContent);
    let output = "";

    for (const line of lines) {
      const result = scriptParser.executeLine(line);
      if (result) {
        output += result + "\n";
      }
    }

    return output.trim();
  }

  return "error: invalid file content";
};

export const handleBash = async (
  args: string[],
  context: CommandContext
): Promise<string> => {
  if (args.length === 0) {
    // Interactive bash session
    return "Welcome to zk-terminal bash-like shell!\nType 'exit' to return to main shell.\nNote: This is a simulated bash environment.";
  }

  // Handle -c option for command execution
  if (args[0] === "-c" && args.length > 1) {
    const commandString = args.slice(1).join(" ");

    // Handle command substitution $(...)
    const commandSubPattern = /\$\(([^)]+)\)/g;
    let processedCommand = commandString;
    let match;

    while ((match = commandSubPattern.exec(commandString)) !== null) {
      const [fullMatch, innerCommand] = match;
      try {
        // Execute the inner command
        const innerResult = await executeCommand(innerCommand, context);
        // Replace the command substitution with its result
        processedCommand = processedCommand.replace(fullMatch, innerResult);
      } catch (error) {
        return `bash: command substitution failed: ${innerCommand}`;
      }
    }

    // Execute the processed command
    try {
      return await executeCommand(processedCommand, context);
    } catch (error) {
      return `bash: ${error}`;
    }
  }

  // Execute script file (original behavior)
  const scriptPath = args[0].startsWith("/")
    ? args[0]
    : pathJoin(context.currentDir, args[0]);
  const fileContent = readFile(scriptPath);

  if (fileContent instanceof Error) {
    return `bash: ${args[0]}: No such file or directory`;
  }

  if (typeof fileContent === "string") {
    const lines = scriptParser.parseScript(fileContent);
    let output = "";

    for (const line of lines) {
      const result = scriptParser.executeLine(line);
      if (result) {
        output += result + "\n";
      }
    }

    return output.trim();
  }

  return "bash: error reading script file";
};
