import { allowedTopics, refusedTopics } from './topics.js';

function matchTopic(message, topics) {
  const normalized = message.toLowerCase();
  for (const topic of topics) {
    for (const keyword of topic.keywords) {
      if (normalized.includes(keyword)) {
        return { topic: topic.name, keyword };
      }
    }
  }
  return null;
}

export function classifyMessage(message) {
  const refusedMatch = matchTopic(message, refusedTopics);
  if (refusedMatch) {
    return {
      status: 'refused',
      topic: refusedMatch.topic,
      confidence: 0.95,
      reasons: [`Matched refused keyword: ${refusedMatch.keyword}`]
    };
  }

  const allowedMatch = matchTopic(message, allowedTopics);
  if (allowedMatch) {
    return {
      status: 'allowed',
      topic: allowedMatch.topic,
      confidence: 0.75,
      reasons: [`Matched allowed keyword: ${allowedMatch.keyword}`]
    };
  }

  return {
    status: 'unknown',
    topic: 'unknown',
    confidence: 0.4,
    reasons: ['No keyword match']
  };
}
