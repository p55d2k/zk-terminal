import {
  memo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

interface TerminalInputProps {
  currentCommand: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  showSuggestions: boolean;
  suggestions: string[];
  inputElementRef?: React.RefObject<HTMLInputElement>;
}

export interface TerminalInputRef {
  focus: () => void;
}

const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(
  (
    {
      currentCommand,
      onChange,
      onKeyDown,
      onBlur,
      showSuggestions,
      suggestions,
      inputElementRef,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    // Set the inputElementRef if provided
    useEffect(() => {
      if (inputElementRef && inputRef.current) {
        (
          inputElementRef as React.MutableRefObject<HTMLInputElement | null>
        ).current = inputRef.current;
      }
    }, [inputElementRef]);

    return (
      <>
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-black text-white outline-none caret-white flex-1 min-w-0 ml-4 animate-pulse"
          value={currentCommand}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          aria-label="Terminal command input"
          autoComplete="off"
          data-testid="terminal-input"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="text-gray-400 text-sm mt-1 ml-4">
            {suggestions.slice(0, 10).join("  ")}
            {suggestions.length > 10 && " ..."}
          </div>
        )}
      </>
    );
  }
);

TerminalInput.displayName = "TerminalInput";

export default TerminalInput;
