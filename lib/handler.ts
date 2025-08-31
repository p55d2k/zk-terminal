import { executeCommand } from "./parser";
import { CommandContext } from "./types";

const sanitizeInput = (input: string): string => {
  // Remove null bytes and other dangerous characters
  return input.replace(/\0/g, "").trim();
};

const validateCommand = (command: string): boolean => {
  // Basic validation: check for reasonable length and no extremely long commands
  return command.length <= 10000; // Arbitrary limit to prevent DoS
};

// Rate limiting
let lastCommandTime = 0;
const COMMAND_RATE_LIMIT = 100; // ms between commands

const isRateLimited = (bypassRateLimit = false): boolean => {
  if (bypassRateLimit) return false;
  const now = Date.now();
  if (now - lastCommandTime < COMMAND_RATE_LIMIT) {
    return true;
  }
  lastCommandTime = now;
  return false;
};

export const handleLastCommand = (
  command: string,
  currentDir: string,
  setCurrentDir: (dir: string) => void,
  bypassRateLimit = false
): string => {
  if (isRateLimited(bypassRateLimit)) {
    return "error: command rate limit exceeded. Please wait before executing another command.";
  }

  const sanitizedCommand = sanitizeInput(command);

  if (!validateCommand(sanitizedCommand)) {
    return "error: command too long or invalid";
  }

  const commandChains = sanitizedCommand
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c);

  let output = "";
  let workingDir = currentDir; // Track working directory across commands

  for (const chain of commandChains) {
    if (chain.includes("&&")) {
      const subCommands = chain
        .split("&&")
        .map((c) => c.trim())
        .filter((c) => c);
      let chainSuccess = true;

      for (const subCmd of subCommands) {
        if (chainSuccess) {
          const context: CommandContext = {
            currentDir: workingDir,
            setCurrentDir: (dir: string) => {
              workingDir = dir;
              setCurrentDir(dir);
            },
            input: undefined,
          };
          const result = executeCommand(subCmd, context);
          if (output && result) output += "\n";
          output += result;
          chainSuccess = !result.startsWith("error:");
        }
      }
    } else if (chain.includes("|")) {
      const subCommands = chain
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c);
      let input = "";

      for (const subCmd of subCommands) {
        const context: CommandContext = {
          currentDir: workingDir,
          setCurrentDir: (dir: string) => {
            workingDir = dir;
            setCurrentDir(dir);
          },
          input,
        };
        const result = executeCommand(subCmd, context);
        if (output && result) output += "\n";
        output += result;
        input = result;
      }
    } else {
      // Single command
      const context: CommandContext = {
        currentDir: workingDir,
        setCurrentDir: (dir: string) => {
          workingDir = dir;
          setCurrentDir(dir);
        },
        input: undefined,
      };
      const result = executeCommand(chain, context);
      if (output && result) output += "\n";
      output += result;
    }
  }

  return output;
};
