"use client";

import { useState, useEffect, useRef } from "react";
import { readFile, writeFile } from "../../lib/filesystem";

interface TextEditorProps {
  filePath: string;
  editorType: "nano" | "vim";
  onClose: () => void;
  onSave: (content: string) => void;
}

const TextEditor = ({
  filePath,
  editorType,
  onClose,
  onSave,
}: TextEditorProps) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vimMode, setVimMode] = useState<"insert" | "command">("insert");
  const [commandBuffer, setCommandBuffer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load file content
    const loadFile = async () => {
      try {
        const fileContent = readFile(filePath);
        if (fileContent instanceof Error) {
          setError(fileContent.message);
        } else {
          setContent(fileContent);
        }
      } catch (err) {
        setError("Failed to load file");
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  useEffect(() => {
    // Focus textarea when component mounts
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSave = async () => {
    try {
      const result = writeFile(filePath, content);
      if (result instanceof Error) {
        setError(result.message);
      } else {
        onSave(content);
        onClose();
      }
    } catch (err) {
      setError("Failed to save file");
    }
  };

  const handleVimCommand = (command: string) => {
    const cmd = command.trim();
    if (cmd === "q") {
      onClose();
    } else if (cmd === "wq") {
      handleSave();
    } else if (cmd === "q!") {
      onClose();
    } else {
      // Unknown command, stay in command mode
      setCommandBuffer("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editorType === "nano") {
      // Nano shortcuts
      if (e.ctrlKey) {
        switch (e.key) {
          case "x":
            e.preventDefault();
            handleSave();
            break;
          case "c":
            e.preventDefault();
            onClose();
            break;
        }
      }
    } else if (editorType === "vim") {
      if (vimMode === "insert") {
        if (e.key === "Escape") {
          e.preventDefault();
          setVimMode("command");
          setCommandBuffer(":");
        }
      } else if (vimMode === "command") {
        if (e.key === "Enter") {
          e.preventDefault();
          const command = commandBuffer.slice(1); // Remove the leading ':'
          handleVimCommand(command);
        } else if (e.key === "Backspace") {
          if (commandBuffer.length > 1) {
            setCommandBuffer(commandBuffer.slice(0, -1));
          }
        } else if (e.key === "Escape") {
          setVimMode("insert");
          setCommandBuffer("");
        } else if (e.key.length === 1) {
          setCommandBuffer(commandBuffer + e.key);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-white">Loading {filePath}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-red-500 text-center">
          <div>Error: {error}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col z-50"
      data-testid="text-editor"
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
        <div className="text-sm">
          {editorType.toUpperCase()} - {filePath}
          {editorType === "vim" && (
            <span className="ml-2 text-yellow-400">
              [{vimMode.toUpperCase()}]
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {editorType === "nano"
            ? "Ctrl+X to save, Ctrl+C to exit"
            : vimMode === "insert"
            ? "Esc for command mode"
            : "Enter to execute command, Esc to return to insert mode"}
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={
          editorType === "vim" && vimMode === "command"
            ? commandBuffer
            : content
        }
        onChange={(e) => {
          if (editorType === "vim" && vimMode === "command") {
            setCommandBuffer(e.target.value);
          } else {
            setContent(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-black text-white font-mono text-sm p-4 outline-none resize-none"
        placeholder={
          editorType === "vim" && vimMode === "command" ? "" : "Start typing..."
        }
        spellCheck={false}
        readOnly={editorType === "vim" && vimMode === "command"}
        data-testid="editor-textarea"
      />

      {/* Footer */}
      <div className="bg-gray-800 p-2 text-xs text-gray-400">
        {editorType === "nano" ? (
          <div>
            ^X Save ^C Exit ^O Write Out ^R Read File ^W Where Is ^K Cut ^U
            Uncut ^J Justify
          </div>
        ) : (
          <div>
            {vimMode === "insert"
              ? "-- INSERT --  Press Esc to exit insert mode"
              : "-- COMMAND --  :q quit  :wq save and quit  :q! force quit"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
