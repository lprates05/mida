import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT || 3000),
  appEnv: process.env.APP_ENV || 'local',
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    token: process.env.WHATSAPP_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
  },
  databaseUrl: process.env.DATABASE_URL || '',
  useLlm: String(process.env.USE_LLM || 'false').toLowerCase() === 'true',
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    apiBase: process.env.LLM_API_BASE || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || 'gpt-4o-mini'
  },
  escalationKeywords: (process.env.ESCALATION_KEYWORDS || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
};

export default config;
