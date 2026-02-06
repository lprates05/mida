import fetch from 'node-fetch';
import config from '../config.js';

export async function sendWhatsAppMessage({ to, body }) {
  const url = `https://graph.facebook.com/v19.0/${config.whatsapp.phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whatsapp.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
