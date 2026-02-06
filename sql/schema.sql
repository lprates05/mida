create table if not exists decision_cards (
  id uuid primary key default gen_random_uuid(),
  wa_message_id text not null,
  user_phone text not null,
  decision_card jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists escalation_tickets (
  id uuid primary key default gen_random_uuid(),
  decision_card_id uuid not null references decision_cards(id),
  status text not null default 'open',
  reason text not null,
  created_at timestamptz not null default now()
);
