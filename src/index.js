import express from 'express';
import config from './config.js';
import { buildDecisionCard, withEscalation } from './services/decisionCard.js';
import { refineWithLlm } from './services/llm.js';
import { storeDecisionCard, createEscalationTicket, healthCheck } from './services/db.js';
import { sendWhatsAppMessage } from './services/whatsapp.js';
import { planClarifyingQuestions, planNextStep } from './services/responsePlanner.js';
import {
  buildResponse,
  buildRefusalResponse,
  buildEscalationResponse
} from './templates/responses.js';
import { needsHumanEscalation } from './services/escalation.js';

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const ok = await healthCheck();
    res.json({ ok });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'db_unavailable' });
  }
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message || message.type !== 'text') {
    return res.sendStatus(200);
  }

  const messageText = message.text?.body || '';
  const waMessageId = message.id;
  const userPhone = message.from;
  const receivedAt = new Date().toISOString();

  let decisionCard = buildDecisionCard({
    messageId: waMessageId,
    userPhone,
    messageText,
    receivedAt
  });
  let llmResponse = null;

  if (config.useLlm) {
    const llmResult = await refineWithLlm({ messageText, decisionCard });
    if (llmResult.ok) {
      const refined = llmResult.data;
      decisionCard = {
        ...decisionCard,
        classification: refined.classification,
        extraction: refined.extraction,
        llm: { used: true, status: 'success' },
        input_summary: decisionCard.input_summary
      };
      llmResponse = refined.response || null;
    } else {
      decisionCard = {
        ...decisionCard,
        llm: { used: true, status: `fallback:${llmResult.error}` }
      };
    }
  }

  const escalation = needsHumanEscalation({ messageText, decisionCard });
  if (escalation.needsHuman) {
    decisionCard = withEscalation(decisionCard, escalation.reason);
  }

  const decisionCardId = await storeDecisionCard({
    waMessageId,
    userPhone,
    decisionCard
  });

  if (decisionCard.decision.needs_human && decisionCardId) {
    await createEscalationTicket({ decisionCardId, reason: decisionCard.decision.escalation_reason });
  }

  let responseText;
  if (decisionCard.decision.needs_human) {
    responseText = buildEscalationResponse();
  } else if (decisionCard.classification.status === 'refused') {
    responseText = buildRefusalResponse(decisionCard);
  } else {
    const clarifyingQuestions = planClarifyingQuestions(
      decisionCard.extraction,
      llmResponse?.clarifying_questions
    );
    const nextStep = planNextStep(decisionCard.extraction, llmResponse?.next_step);
    responseText = buildResponse({ decisionCard, clarifyingQuestions, nextStep });
  }

  await sendWhatsAppMessage({ to: userPhone, body: responseText });

  return res.sendStatus(200);
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
