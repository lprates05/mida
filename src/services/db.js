import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10
});

export async function storeDecisionCard({ waMessageId, userPhone, decisionCard }) {
  const query =
    'insert into decision_cards (wa_message_id, user_phone, decision_card) values ($1, $2, $3) returning id';
  const values = [waMessageId, userPhone, decisionCard];
  const result = await pool.query(query, values);
  return result.rows[0]?.id;
}

export async function createEscalationTicket({ decisionCardId, reason }) {
  const query =
    'insert into escalation_tickets (decision_card_id, reason) values ($1, $2) returning id';
  const values = [decisionCardId, reason];
  const result = await pool.query(query, values);
  return result.rows[0]?.id;
}

export async function healthCheck() {
  const result = await pool.query('select 1 as ok');
  return result.rows[0]?.ok === 1;
}

export default pool;
