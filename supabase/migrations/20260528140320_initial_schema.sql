create table public.rooms (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,

    host_auth_id text not null,

    service_fee_percent integer not null default 10,

    created_at timestamptz not null default now()
);

create table public.participants (
    id uuid primary key default gen_random_uuid(),

    room_id uuid not null references public.rooms(id)
        on delete cascade,

    auth_id text not null,

    nickname text not null,

    created_at timestamptz not null default now()
);

create table public.items (
    id uuid primary key default gen_random_uuid(),

    room_id uuid not null references public.rooms(id)
        on delete cascade,

    name text not null,

    price_cents integer not null,

    created_at timestamptz not null default now()
);

create table public.item_consumers (
    item_id uuid not null references public.items(id)
        on delete cascade,

    participant_id uuid not null references public.participants(id)
        on delete cascade,

    primary key (item_id, participant_id)
);

create index idx_participants_room
    on public.participants(room_id);

create index idx_items_room
    on public.items(room_id);

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.items enable row level security;
alter table public.item_consumers enable row level security;
