import React from "react";

// ANSI color codes mapping to CSS color values
const ansiToColor: { [key: string]: string } = {
  "31": "#ff5555", // red
  "32": "#50fa7b", // green
  "33": "#f1fa8c", // yellow
  "34": "#bd93f9", // blue
  "35": "#ff79c6", // magenta
  "36": "#8be9fd", // cyan
  "37": "#f8f8f2", // white
  "91": "#ff6e6e", // bright red
  "92": "#69ff94", // bright green
  "93": "#ffffa5", // bright yellow
  "94": "#d6acff", // bright blue
  "95": "#ff92df", // bright magenta
  "96": "#a4ffff", // bright cyan
  "97": "#ffffff", // bright white
};

export const parseAnsiOutput = (output: string): React.ReactElement => {
  if (!output.includes("\x1b[")) {
    return <span>{output}</span>;
  }

  const parts: React.ReactElement[] = [];
  let currentText = "";
  let currentColor = "";
  let i = 0;

  while (i < output.length) {
    if (output[i] === "\x1b" && output[i + 1] === "[") {
      // Found ANSI escape sequence
      if (currentText) {
        parts.push(
          <span
            key={parts.length}
            style={currentColor ? { color: currentColor } : undefined}
          >
            {currentText}
          </span>
        );
        currentText = "";
      }

      // Parse the ANSI code
      let j = i + 2;
      let code = "";
      while (j < output.length && output[j] !== "m") {
        if (output[j] !== "[") {
          code += output[j];
        }
        j++;
      }

      if (output[j] === "m") {
        if (code === "0") {
          currentColor = ""; // Reset
        } else if (ansiToColor[code]) {
          currentColor = ansiToColor[code];
        }
        i = j + 1;
      } else {
        // Invalid sequence, treat as regular text
        currentText += output[i];
        i++;
      }
    } else {
      currentText += output[i];
      i++;
    }
  }

  if (currentText) {
    parts.push(
      <span
        key={parts.length}
        style={currentColor ? { color: currentColor } : undefined}
      >
        {currentText}
      </span>
    );
  }

  return <span>{parts}</span>;
};
