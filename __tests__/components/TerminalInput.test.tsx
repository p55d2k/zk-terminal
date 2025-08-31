import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TerminalInput, {
  TerminalInputRef,
} from "../../app/components/TerminalInput";

describe("TerminalInput", () => {
  const defaultProps = {
    currentCommand: "",
    onChange: jest.fn(),
    onKeyDown: jest.fn(),
    onBlur: jest.fn(),
    showSuggestions: false,
    suggestions: [],
  };

  it("renders input field", () => {
    render(<TerminalInput {...defaultProps} />);
    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    expect(input).toBeInTheDocument();
  });

  it("displays current command value", () => {
    const command = "ls -la";
    render(<TerminalInput {...defaultProps} currentCommand={command} />);
    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    expect(input).toHaveValue(command);
  });

  it("calls onChange when input value changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TerminalInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    await user.type(input, "test command");

    expect(onChange).toHaveBeenCalledTimes(12); // 'test command' has 12 characters
  });

  it("calls onKeyDown when key is pressed", async () => {
    const user = userEvent.setup();
    const onKeyDown = jest.fn();
    render(<TerminalInput {...defaultProps} onKeyDown={onKeyDown} />);

    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    await user.type(input, "{enter}");

    expect(onKeyDown).toHaveBeenCalled();
  });

  it("shows suggestions when showSuggestions is true", () => {
    const suggestions = ["file1.txt", "file2.txt", "folder1"];
    render(
      <TerminalInput
        {...defaultProps}
        showSuggestions={true}
        suggestions={suggestions}
      />
    );

    const suggestionsDiv = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "div" &&
        content.includes("file1.txt") &&
        content.includes("file2.txt") &&
        content.includes("folder1")
      );
    });
    expect(suggestionsDiv).toBeInTheDocument();
  });

  it("limits suggestions to 10 items", () => {
    const suggestions = Array.from({ length: 15 }, (_, i) => `file${i}.txt`);
    render(
      <TerminalInput
        {...defaultProps}
        showSuggestions={true}
        suggestions={suggestions}
      />
    );

    const suggestionsDiv = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "div" &&
        content.includes("file0.txt") &&
        content.includes("file9.txt") &&
        content.includes("...")
      );
    });
    expect(suggestionsDiv).toBeInTheDocument();

    // Should not show the 11th item individually
    expect(screen.queryByText("file10.txt")).not.toBeInTheDocument();
  });

  it("does not show suggestions when showSuggestions is false", () => {
    const suggestions = ["file1.txt", "file2.txt"];
    render(
      <TerminalInput
        {...defaultProps}
        showSuggestions={false}
        suggestions={suggestions}
      />
    );

    const suggestionsDiv = screen.queryByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "div" &&
        content.includes("file1.txt")
      );
    });
    expect(suggestionsDiv).not.toBeInTheDocument();
  });

  it("calls onBlur when input loses focus", () => {
    const onBlur = jest.fn();
    render(<TerminalInput {...defaultProps} onBlur={onBlur} />);

    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalled();
  });

  it("exposes focus method via ref", () => {
    const ref = React.createRef<TerminalInputRef>();
    render(<TerminalInput {...defaultProps} ref={ref} />);

    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });
    const focusSpy = jest.spyOn(input, "focus");

    ref.current?.focus();

    expect(focusSpy).toHaveBeenCalled();
  });

  it("has correct styling classes", () => {
    render(<TerminalInput {...defaultProps} />);
    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });

    expect(input).toHaveClass(
      "w-full",
      "bg-black",
      "text-white",
      "outline-none",
      "caret-white",
      "flex-1",
      "min-w-0",
      "ml-4",
      "animate-pulse"
    );
  });
});
