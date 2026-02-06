import { classifyMessage } from '../rules/classifier.js';
import { extractEntities, summarizeExtraction } from '../rules/extractor.js';

export function buildDecisionCard({ messageId, userPhone, messageText, receivedAt }) {
  const classification = classifyMessage(messageText);
  const extraction = extractEntities(messageText);

  const decisionCard = {
    version: '1.0',
    message_id: messageId,
    user: {
      phone: userPhone
    },
    received_at: receivedAt,
    input_summary: summarizeExtraction(extraction),
    classification,
    extraction,
    decision: {
      needs_human: false,
      escalation_reason: null,
      refused_reason: classification.status === 'refused' ? classification.topic : null
    },
    llm: {
      used: false,
      status: 'not_requested'
    }
  };

  return decisionCard;
}

export function withEscalation(decisionCard, reason) {
  return {
    ...decisionCard,
    decision: {
      ...decisionCard.decision,
      needs_human: true,
      escalation_reason: reason
    }
  };
}
