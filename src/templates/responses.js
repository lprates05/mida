const supportiveOpeners = [
  'Thanks for sharing that — I can help with a quick plan.',
  'Appreciate the details. Let’s sort this out step by step.',
  'Got it. I can help you map this out.'
];

function pickSupportiveOpening() {
  return supportiveOpeners[Math.floor(Math.random() * supportiveOpeners.length)];
}

export function buildResponse({ decisionCard, clarifyingQuestions, nextStep }) {
  const { classification, extraction } = decisionCard;
  const assumptions = [];

  if (!extraction.amounts.length) {
    assumptions.push('You have a target amount in mind.');
  }
  if (!extraction.timeframes.length) {
    assumptions.push('You have a timeline you’re aiming for.');
  }
  if (!extraction.goals.length) {
    assumptions.push('You have a primary goal for this plan.');
  }

  const assumptionText = assumptions.length
    ? `Assumptions: ${assumptions.join(' ')}`
    : 'Assumptions: I captured your main goal and constraints correctly.';

  const questionsText = clarifyingQuestions.length
    ? `Clarifying questions (max 3):\n- ${clarifyingQuestions.join('\n- ')}`
    : 'Clarifying questions: None right now.';

  const explanation = `Why: Classified as ${classification.status} (${classification.topic}).`;

  return [
    pickSupportiveOpening(),
    explanation,
    assumptionText,
    questionsText,
    `Next step: ${nextStep}`
  ].join('\n\n');
}

export function buildRefusalResponse(decisionCard) {
  const reason = decisionCard.decision.refused_reason || 'not supported';
  return [
    'Thanks for reaching out. I can’t help with that request.',
    `Why: The topic is ${reason}.`,
    'If you have a budgeting, saving, or debt payoff question, I can help with that.'
  ].join('\n\n');
}

export function buildEscalationResponse() {
  return [
    'Thanks for the context. I’m looping in a human specialist to help you next.',
    'Next step: A human agent will review your request and follow up shortly.'
  ].join('\n\n');
}
