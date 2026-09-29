create table if not exists cards (
  id bigserial primary key,
  provider_card_id text not null,
  game_year integer not null default 27,
  name text not null,
  rating integer not null,
  position text,
  version text,
  league text,
  club text,
  nation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_card_id, game_year)
);

create table if not exists price_snapshots (
  id bigserial primary key,
  card_id bigint not null references cards(id) on delete cascade,
  platform text not null check (platform in ('pc', 'console')),
  price integer not null check (price > 0),
  observed_at timestamptz not null,
  provider text not null,
  unique(card_id, platform, observed_at, provider)
);

create index if not exists price_snapshots_lookup
  on price_snapshots(card_id, platform, observed_at desc);

create table if not exists portfolio_positions (
  id bigserial primary key,
  card_id bigint not null references cards(id),
  quantity integer not null check (quantity > 0),
  buy_price integer not null check (buy_price > 0),
  bought_at timestamptz not null default now(),
  sold_at timestamptz,
  sell_price integer
);

create table if not exists market_events (
  id bigserial primary key,
  event_type text not null,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
