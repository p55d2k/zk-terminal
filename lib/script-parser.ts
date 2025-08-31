import { ScriptContext } from "./types";
import { envManager } from "./env-manager";

class ScriptParser {
  private context: ScriptContext;

  constructor() {
    this.context = {
      variables: new Map(),
      functions: new Map(),
      currentLine: 0,
    };
  }

  parseScript(content: string): string[] {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    return lines;
  }

  executeLine(line: string): string {
    // Handle variable assignment
    if (line.includes("=")) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        const [, name, value] = match;
        const expandedValue = envManager.expandVariables(value);
        this.context.variables.set(name, expandedValue);
        return "";
      }
    }

    // Handle echo with variables
    if (line.startsWith("echo ")) {
      const text = line.slice(5);
      return envManager.expandVariables(text);
    }

    // Handle if statements (basic)
    if (line.startsWith("if ")) {
      // For now, just skip if statements
      return "";
    }

    // Handle for loops (basic)
    if (line.startsWith("for ")) {
      // For now, just skip for loops
      return "";
    }

    // Handle function definitions
    if (line.includes("() {")) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\) \{/);
      if (match) {
        const funcName = match[1];
        // Store function (simplified)
        this.context.functions.set(funcName, line);
        return "";
      }
    }

    // Handle function calls
    const funcMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const func = this.context.functions.get(funcName);
      if (func) {
        // Execute function (simplified)
        return `Function ${funcName} executed`;
      }
    }

    // Expand variables in the line
    const expandedLine = envManager.expandVariables(line);

    // Return the expanded line for execution
    return expandedLine;
  }

  getVariable(name: string): string | undefined {
    return this.context.variables.get(name) || envManager.getVariable(name);
  }

  setVariable(name: string, value: string): void {
    this.context.variables.set(name, value);
  }

  reset(): void {
    this.context = {
      variables: new Map(),
      functions: new Map(),
      currentLine: 0,
    };
  }
}

export const scriptParser = new ScriptParser();
