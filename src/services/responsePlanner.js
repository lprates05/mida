function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((question) => String(question).trim()).filter(Boolean).slice(0, 3);
}

export function planClarifyingQuestions(extraction, llmQuestions) {
  const normalized = normalizeQuestions(llmQuestions);
  if (normalized.length) {
    return normalized;
  }

  const questions = [];
  if (!extraction.goals.length) {
    questions.push('What is the main goal you want to achieve?');
  }
  if (!extraction.amounts.length) {
    questions.push('What target amount are you aiming for?');
  }
  if (!extraction.timeframes.length) {
    questions.push('What timeline are you targeting?');
  }
  return questions.slice(0, 3);
}

export function planNextStep(extraction, llmNextStep) {
  if (llmNextStep && String(llmNextStep).trim()) {
    return String(llmNextStep).trim();
  }

  if (extraction.goals.length && extraction.amounts.length && extraction.timeframes.length) {
    return 'I can draft a simple plan and budget breakdown once you confirm any constraints.';
  }
  return 'Answer the questions above so I can draft a simple plan for you.';
}
