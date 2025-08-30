import { executeCommand } from "./parser";
import { CommandContext } from "./types";

export const handleLastCommand = (
  command: string,
  currentDir: string,
  setCurrentDir: (dir: string) => void
): string => {
  const commandChains = command
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c);

  let output = "";

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
            currentDir,
            setCurrentDir,
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
          currentDir,
          setCurrentDir,
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
        currentDir,
        setCurrentDir,
        input: undefined,
      };
      const result = executeCommand(chain, context);
      if (output && result) output += "\n";
      output += result;
    }
  }

  return output;
};
