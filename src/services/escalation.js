import config from '../config.js';

export function needsHumanEscalation({ messageText, decisionCard }) {
  const normalized = messageText.toLowerCase();
  const requestedHuman = config.escalationKeywords.some((keyword) => normalized.includes(keyword));

  if (requestedHuman) {
    return { needsHuman: true, reason: 'User requested human assistance' };
  }

  if (decisionCard.classification.status === 'refused') {
    return { needsHuman: true, reason: 'Refused topic requires human review' };
  }

  if (decisionCard.classification.status === 'unknown' && decisionCard.extraction.goals.length === 0) {
    return { needsHuman: true, reason: 'Low confidence and missing goal' };
  }

  return { needsHuman: false, reason: null };
}
