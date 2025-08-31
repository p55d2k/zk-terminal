// Fuzzy matching utility for command completion
export const fuzzyMatch = (input: string, target: string): { score: number; matches: boolean } => {
  if (!input) return { score: 0, matches: true };

  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match gets highest score
  if (targetLower === inputLower) {
    return { score: 100, matches: true };
  }

  // Starts with match gets high score
  if (targetLower.startsWith(inputLower)) {
    return { score: 90, matches: true };
  }

  // Contains match gets medium score
  if (targetLower.includes(inputLower)) {
    return { score: 50, matches: true };
  }

  // Fuzzy matching - check if all characters of input appear in order in target
  let inputIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < targetLower.length && inputIndex < inputLower.length; i++) {
    if (targetLower[i] === inputLower[inputIndex]) {
      inputIndex++;
      score += 10; // Base score for each match
      consecutiveMatches++;

      // Bonus for consecutive matches
      if (consecutiveMatches > 1) {
        score += 5 * consecutiveMatches;
      }

      // Bonus for matches at the beginning
      if (i < 3) {
        score += 5;
      }
    } else {
      consecutiveMatches = 0;
    }
  }

  const matches = inputIndex === inputLower.length;
  return { score: matches ? score : 0, matches };
};

export const getFuzzyCompletions = (input: string, candidates: string[]): string[] => {
  if (!input) return candidates;

  const scored = candidates.map(candidate => ({
    candidate,
    ...fuzzyMatch(input, candidate)
  })).filter(item => item.matches);

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored.map(item => item.candidate);
};
