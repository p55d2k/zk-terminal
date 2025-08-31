import { EnvironmentVariable } from "./types";

class EnvironmentManager {
  private variables: Map<string, string> = new Map();

  constructor() {
    // Initialize with comprehensive Unix-like environment variables
    this.setVariable("HOME", "/home/user");
    this.setVariable("USER", "user");
    this.setVariable("USERNAME", "user");
    this.setVariable("LOGNAME", "user");
    this.setVariable("SHELL", "/bin/bash");
    this.setVariable("PWD", "/");
    this.setVariable("OLDPWD", "/");

    // PATH with common Unix directories
    this.setVariable("PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games");

    // Language and locale
    this.setVariable("LANG", "en_US.UTF-8");
    this.setVariable("LC_ALL", "en_US.UTF-8");
    this.setVariable("LC_CTYPE", "en_US.UTF-8");

    // Terminal settings
    this.setVariable("TERM", "xterm-256color");
    this.setVariable("TERM_PROGRAM", "zk-terminal");
    this.setVariable("COLUMNS", "80");
    this.setVariable("LINES", "24");

    // System paths
    this.setVariable("TMPDIR", "/tmp");
    this.setVariable("TMP", "/tmp");
    this.setVariable("TEMP", "/tmp");

    // User-specific paths
    this.setVariable("XDG_CONFIG_HOME", "/home/user/.config");
    this.setVariable("XDG_DATA_HOME", "/home/user/.local/share");
    this.setVariable("XDG_CACHE_HOME", "/home/user/.cache");

    // Common application paths
    this.setVariable("EDITOR", "nano");
    this.setVariable("VISUAL", "nano");
    this.setVariable("PAGER", "less");
    this.setVariable("BROWSER", "open");

    // Development paths
    this.setVariable("GOPATH", "/home/user/go");
    this.setVariable("GOROOT", "/usr/local/go");
    this.setVariable("NODE_PATH", "/usr/local/lib/node_modules");
    this.setVariable("PYTHONPATH", "/usr/local/lib/python3.9/site-packages");

    // History settings
    this.setVariable("HISTSIZE", "1000");
    this.setVariable("HISTFILESIZE", "2000");
    this.setVariable("HISTCONTROL", "ignoredups");

    // Timezone
    this.setVariable("TZ", "UTC");

    // Host information
    this.setVariable("HOSTNAME", "zk-terminal");
    this.setVariable("HOSTTYPE", "web");
    this.setVariable("OSTYPE", "web-terminal");
    this.setVariable("MACHTYPE", "web-js");

    // Process information
    this.setVariable("PPID", "1");
    this.setVariable("UID", "1000");
    this.setVariable("EUID", "1000");
    this.setVariable("GROUPS", "1000");
  }

  setVariable(name: string, value: string): void {
    this.variables.set(name.toUpperCase(), value);
  }

  getVariable(name: string): string | undefined {
    return this.variables.get(name.toUpperCase());
  }

  unsetVariable(name: string): boolean {
    return this.variables.delete(name.toUpperCase());
  }

  getAllVariables(): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];
    const entries = Array.from(this.variables.entries());
    for (const [name, value] of entries) {
      vars.push({ name, value });
    }
    return vars;
  }

  expandVariables(text: string): string {
    return text.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, varName) => {
      const value = this.getVariable(varName);
      return value !== undefined ? value : match;
    });
  }

  updatePwd(newPwd: string): void {
    const oldPwd = this.getVariable("PWD");
    if (oldPwd) {
      this.setVariable("OLDPWD", oldPwd);
    }
    this.setVariable("PWD", newPwd);
  }
}

export const envManager = new EnvironmentManager();
