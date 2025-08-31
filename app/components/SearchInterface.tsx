import { memo } from "react";

interface CommandHistory {
  dir: string;
  command: string;
}

interface SearchInterfaceProps {
  searchQuery: string;
  searchResults: CommandHistory[];
  searchIndex: number;
}

const SearchInterface = memo<SearchInterfaceProps>(({
  searchQuery,
  searchResults,
  searchIndex
}) => {
  return (
    <div className="flex flex-col w-full ml-4">
      <div className="flex items-center space-x-2">
        <span className="text-yellow-400">reverse-i-search:</span>
        <span className="text-white">`{searchQuery}`</span>
        <span className="text-gray-400">
          {searchIndex >= 0 && searchResults[searchIndex]
            ? searchResults[searchIndex].command
            : ""}
        </span>
      </div>
      {searchResults.length > 1 && (
        <div className="text-gray-500 text-sm mt-1">
          {searchResults.length} matches found. Use ↑↓ to navigate.
        </div>
      )}
    </div>
  );
});

SearchInterface.displayName = "SearchInterface";

export default SearchInterface;
