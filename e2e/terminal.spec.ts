import { test, expect } from "@playwright/test";

test.describe("Terminal Basic Functionality", () => {
  test("should load the terminal interface", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/zk-terminal/);

    // Check if terminal input is present
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await expect(terminalInput).toBeVisible();
  });

  test("should display welcome message", async ({ page }) => {
    await page.goto("/");

    // Check for welcome message in terminal output
    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("Welcome to zk-terminal");
  });

  test("should execute basic commands", async ({ page }) => {
    await page.goto("/");

    // Test pwd command
    const terminalInput = page.locator('[data-testid="terminal-input"]');
    await terminalInput.fill("pwd");
    await terminalInput.press("Enter");

    // Wait for command execution
    await page.waitForTimeout(500);

    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("/");
  });

  test("should handle command history", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Execute a few commands
    await terminalInput.fill('echo "test1"');
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    await terminalInput.fill('echo "test2"');
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    // Check if up arrow shows previous command
    await terminalInput.press("ArrowUp");
    await expect(terminalInput).toHaveValue('echo "test2"');

    await terminalInput.press("ArrowUp");
    await expect(terminalInput).toHaveValue('echo "test1"');
  });

  test("should handle file operations", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Create a file
    await terminalInput.fill("touch testfile.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    // List files to verify creation
    await terminalInput.fill("ls");
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("testfile.txt");
  });
});

test.describe("Terminal Advanced Features", () => {
  test("should handle command chaining", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Test sequential commands
    await terminalInput.fill('echo "hello" ; echo "world"');
    await terminalInput.press("Enter");
    await page.waitForTimeout(500);

    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("hello");
    await expect(terminalOutput).toContainText("world");
  });

  test("should handle conditional execution", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Test && operator
    await terminalInput.fill("mkdir testdir && cd testdir && pwd");
    await terminalInput.press("Enter");
    await page.waitForTimeout(500);

    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("/testdir");
  });

  test("should handle tab completion", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Create a file for completion
    await terminalInput.fill("touch mytestfile.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    // Try tab completion
    await terminalInput.fill("cat my");
    await terminalInput.press("Tab");
    await page.waitForTimeout(200);

    // Should complete to 'cat mytestfile.txt'
    await expect(terminalInput).toHaveValue("cat mytestfile.txt");
  });
});

test.describe("Text Editor Integration", () => {
  test("should open nano editor", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Create and open file with nano
    await terminalInput.fill("nano test.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(500);

    // Check if editor is opened
    const editor = page.locator('[data-testid="text-editor"]');
    await expect(editor).toBeVisible();
  });

  test("should open vim editor", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Create and open file with vim
    await terminalInput.fill("vim test.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(500);

    // Check if editor is opened
    const editor = page.locator('[data-testid="text-editor"]');
    await expect(editor).toBeVisible();
  });

  test("should save and exit editor", async ({ page }) => {
    await page.goto("/");

    const terminalInput = page.locator('[data-testid="terminal-input"]');

    // Open nano editor
    await terminalInput.fill("nano test.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(500);

    // Type some content
    const editorTextarea = page.locator('[data-testid="editor-textarea"]');
    await editorTextarea.fill("Hello from automated test!");

    // Save and exit (Ctrl+X, then Y, then Enter for nano)
    await page.keyboard.press("Control+x");
    await page.waitForTimeout(200);
    await page.keyboard.press("y");
    await page.waitForTimeout(200);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    // Verify content was saved
    await terminalInput.fill("cat test.txt");
    await terminalInput.press("Enter");
    await page.waitForTimeout(200);

    const terminalOutput = page.locator('[data-testid="terminal-output"]');
    await expect(terminalOutput).toContainText("Hello from automated test!");
  });
});
