import fetch from 'node-fetch';
import config from '../config.js';

const decisionCardSchema = {
  type: 'object',
  required: ['classification', 'extraction'],
  properties: {
    classification: {
      type: 'object',
      required: ['status', 'topic', 'confidence', 'reasons']
    },
    extraction: {
      type: 'object',
      required: ['amounts', 'timeframes', 'goals', 'constraints']
    },
    response: {
      type: 'object',
      properties: {
        clarifying_questions: { type: 'array' },
        next_step: { type: 'string' }
      }
    }
  }
};

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function validateLlmPayload(payload) {
  if (!isObject(payload)) return false;
  const { classification, extraction } = payload;
  if (!isObject(classification) || !isObject(extraction)) return false;
  const statusOk = ['allowed', 'refused', 'unknown'].includes(classification.status);
  if (!statusOk) return false;
  const extractionFields = ['amounts', 'timeframes', 'goals', 'constraints'];
  return extractionFields.every((field) => Array.isArray(extraction[field]));
}

export async function refineWithLlm({ messageText, decisionCard }) {
  if (!config.llm.apiKey) {
    return { ok: false, error: 'Missing LLM API key' };
  }

  const payload = {
    model: config.llm.model,
    messages: [
      {
        role: 'system',
        content:
          'You refine classification/extraction for a WhatsApp finance bot. Respond with JSON only.'
      },
      {
        role: 'user',
        content: JSON.stringify({
          message: messageText,
          current: {
            classification: decisionCard.classification,
            extraction: decisionCard.extraction
          },
          schema: decisionCardSchema
        })
      }
    ],
    temperature: 0.2
  };

  const response = await fetch(`${config.llm.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return { ok: false, error: `LLM error: ${response.status}` };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, error: 'LLM response missing content' };
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return { ok: false, error: 'LLM returned invalid JSON' };
  }

  if (!validateLlmPayload(parsed)) {
    return { ok: false, error: 'LLM JSON failed validation' };
  }

  return { ok: true, data: parsed };
}
