const amountRegex = /(?:\$|usd\s?)?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/gi;
const timeframeRegex =
  /(\b\d+\s?(?:day|week|month|year)s?\b|\bby\s+\w+\b|\bnext\s+\w+\b|\bin\s+\d+\s?(?:day|week|month|year)s?\b)/gi;

function extractAmounts(message) {
  return Array.from(message.matchAll(amountRegex)).map((match) => ({
    value: match[0].replace(/usd\s?/i, '').trim(),
    currency: match[0].toLowerCase().includes('$') ? 'USD' : 'unspecified'
  }));
}

function extractTimeframes(message) {
  return Array.from(message.matchAll(timeframeRegex)).map((match) => match[0]);
}

function extractGoals(message) {
  const patterns = [
    /goal(?: is|:)\s+([^.!?]+)/i,
    /want to\s+([^.!?]+)/i,
    /need to\s+([^.!?]+)/i
  ];
  const results = [];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      results.push(match[1].trim());
    }
  }
  return results;
}

function extractConstraints(message) {
  const patterns = [/can't\s+([^.!?]+)/i, /cannot\s+([^.!?]+)/i, /must\s+([^.!?]+)/i];
  const results = [];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      results.push(match[1].trim());
    }
  }
  return results;
}

export function extractEntities(message) {
  const amounts = extractAmounts(message);
  const timeframes = extractTimeframes(message);
  const goals = extractGoals(message);
  const constraints = extractConstraints(message);

  return {
    amounts,
    timeframes,
    goals,
    constraints
  };
}

export function summarizeExtraction(extraction) {
  const parts = [];
  if (extraction.goals.length) {
    parts.push(`Goals: ${extraction.goals.join('; ')}`);
  }
  if (extraction.amounts.length) {
    parts.push(
      `Amounts: ${extraction.amounts
        .map((amount) => `${amount.value} ${amount.currency}`.trim())
        .join(', ')}`
    );
  }
  if (extraction.timeframes.length) {
    parts.push(`Timeframes: ${extraction.timeframes.join(', ')}`);
  }
  if (extraction.constraints.length) {
    parts.push(`Constraints: ${extraction.constraints.join('; ')}`);
  }
  return parts.join(' | ') || 'No structured details extracted.';
}
