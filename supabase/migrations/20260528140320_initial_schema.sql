create extension if not exists "uuid-ossp";

create table public.rooms (
    id uuid primary key default uuid_generate_v4(),

    code text not null unique,

    host_auth_id uuid not null,

    service_fee_percent numeric(5,2) not null default 10.00,

    status text not null default 'active'
        check (status in ('active', 'closed')),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.participants (
    id uuid primary key default uuid_generate_v4(),

    room_id uuid not null references public.rooms(id)
        on delete cascade,

    auth_id uuid not null,

    nickname text not null,

    joined_at timestamptz not null default now(),

    unique(room_id, auth_id)
);

create table public.items (
    id uuid primary key default uuid_generate_v4(),

    room_id uuid not null references public.rooms(id)
        on delete cascade,

    created_by uuid not null references public.participants(id)
        on delete cascade,

    name text not null,

    price_cents integer not null
        check (price_cents > 0),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.item_consumers (
    id uuid primary key default uuid_generate_v4(),

    item_id uuid not null references public.items(id)
        on delete cascade,

    participant_id uuid not null references public.participants(id)
        on delete cascade,

    selected_at timestamptz not null default now(),

    unique(item_id, participant_id)
);

create table public.suggestions (
    id uuid primary key default uuid_generate_v4(),

    normalized_name text not null unique,

    display_name text not null,

    usage_count integer not null default 1,

    created_at timestamptz not null default now()
);

create index idx_participants_room_id
    on public.participants(room_id);

create index idx_items_room_id
    on public.items(room_id);

create index idx_item_consumers_item_id
    on public.item_consumers(item_id);

create index idx_item_consumers_participant_id
    on public.item_consumers(participant_id);

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.items enable row level security;
alter table public.item_consumers enable row level security;
alter table public.suggestions enable row level security;