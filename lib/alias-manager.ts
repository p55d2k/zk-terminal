import { Alias } from "./types";

class AliasManager {
  private aliases: Map<string, string> = new Map();

  constructor() {
    // Initialize with common Unix-like aliases
    this.setAlias("ll", "ls -l");
    this.setAlias("la", "ls -la");
    this.setAlias("l", "ls -CF");
    this.setAlias("ls", "ls --color=auto");
    this.setAlias("dir", "ls");
    this.setAlias("vdir", "ls -l");

    // Navigation aliases
    this.setAlias("..", "cd ..");
    this.setAlias("...", "cd ../..");
    this.setAlias("....", "cd ../../..");
    this.setAlias(".....", "cd ../../../..");

    // File operation aliases
    this.setAlias("cp", "cp -i");
    this.setAlias("mv", "mv -i");
    this.setAlias("rm", "rm -i");
    this.setAlias("mkdir", "mkdir -p");

    // Text processing aliases
    this.setAlias("grep", "grep --color=auto");
    this.setAlias("fgrep", "fgrep --color=auto");
    this.setAlias("egrep", "egrep --color=auto");

    // System aliases
    this.setAlias("h", "history");
    this.setAlias("j", "jobs -l");
    this.setAlias("p", "ps aux");
    this.setAlias("x", "exit");

    // Development aliases
    this.setAlias("vi", "vim");
    this.setAlias("emacs", "nano"); // Fallback for systems without emacs
    this.setAlias("py", "python3");
    this.setAlias("python", "python3");

    // Network aliases
    this.setAlias("wget", "wget --no-check-certificate");
    this.setAlias("curl", "curl --silent");

    // Utility aliases
    this.setAlias("cls", "clear");
    this.setAlias("c", "clear");
    this.setAlias("q", "exit");
    this.setAlias("bye", "exit");
    this.setAlias("logout", "exit");
  }

  setAlias(name: string, command: string): void {
    this.aliases.set(name, command);
  }

  getAlias(name: string): string | undefined {
    return this.aliases.get(name);
  }

  removeAlias(name: string): boolean {
    return this.aliases.delete(name);
  }

  getAllAliases(): Alias[] {
    const aliases: Alias[] = [];
    const entries = Array.from(this.aliases.entries());
    for (const [name, command] of entries) {
      aliases.push({ name, command });
    }
    return aliases;
  }

  expandAlias(command: string): string {
    const parts = command.split(" ");
    const aliasName = parts[0];
    const aliasCommand = this.getAlias(aliasName);

    if (aliasCommand) {
      const args = parts.slice(1).join(" ");
      return args ? `${aliasCommand} ${args}` : aliasCommand;
    }

    return command;
  }

  listAliases(): string {
    const aliases = this.getAllAliases();
    if (aliases.length === 0) {
      return "No aliases defined";
    }

    return aliases
      .map((alias) => `alias ${alias.name}='${alias.command}'`)
      .join("\n");
  }
}

export const aliasManager = new AliasManager();
