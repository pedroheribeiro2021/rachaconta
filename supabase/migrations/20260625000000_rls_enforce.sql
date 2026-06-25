-- Substitui todas as policies permissivas (true) por isolamento real por sessão anônima.
-- auth.uid() → uuid; host_auth_id/auth_id → text: usar ::text em comparações.

-- ─── helpers (security definer evita recursão RLS em participants) ───────────

create or replace function public.is_room_participant(p_room_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from participants
    where room_id = p_room_id and auth_id = auth.uid()::text
  );
$$;

create or replace function public.is_own_participant(p_participant_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from participants
    where id = p_participant_id and auth_id = auth.uid()::text
  );
$$;

-- ─── drop policies permissivas ───────────────────────────────────────────────

drop policy if exists "rooms_select"          on public.rooms;
drop policy if exists "rooms_insert"          on public.rooms;
drop policy if exists "participants_select"   on public.participants;
drop policy if exists "participants_insert"   on public.participants;
drop policy if exists "items_select"          on public.items;
drop policy if exists "items_insert"          on public.items;
drop policy if exists "items_update"          on public.items;
drop policy if exists "items_delete"          on public.items;
drop policy if exists "item_consumers_select" on public.item_consumers;
drop policy if exists "item_consumers_insert" on public.item_consumers;
drop policy if exists "item_consumers_delete" on public.item_consumers;

-- ─── rooms ───────────────────────────────────────────────────────────────────

-- open read: joinRoom precisa ler a mesa pelo código antes de ser participante
create policy "rooms_select"
  on public.rooms for select to authenticated using (true);

create policy "rooms_insert"
  on public.rooms for insert to authenticated
  with check (host_auth_id = auth.uid()::text);

-- ─── participants ─────────────────────────────────────────────────────────────

create policy "participants_select"
  on public.participants for select to authenticated
  using (is_room_participant(room_id));

create policy "participants_insert"
  on public.participants for insert to authenticated
  with check (auth_id = auth.uid()::text);

-- ─── items ────────────────────────────────────────────────────────────────────

create policy "items_select"
  on public.items for select to authenticated
  using (is_room_participant(room_id));

create policy "items_insert"
  on public.items for insert to authenticated
  with check (is_room_participant(room_id));

-- sem created_by → melhor granularidade possível é "participante da mesa"
create policy "items_update"
  on public.items for update to authenticated
  using (is_room_participant(room_id))
  with check (is_room_participant(room_id));

create policy "items_delete"
  on public.items for delete to authenticated
  using (is_room_participant(room_id));

-- ─── item_consumers ───────────────────────────────────────────────────────────

-- ver todos os consumers de itens na sua mesa
create policy "item_consumers_select"
  on public.item_consumers for select to authenticated
  using (
    exists (
      select 1 from public.items i
      where i.id = item_consumers.item_id and is_room_participant(i.room_id)
    )
  );

-- só pode se marcar; o item deve ser da sua mesa
create policy "item_consumers_insert"
  on public.item_consumers for insert to authenticated
  with check (
    is_own_participant(participant_id)
    and exists (
      select 1 from public.items i
      where i.id = item_consumers.item_id and is_room_participant(i.room_id)
    )
  );

-- só pode se desmarcar
create policy "item_consumers_delete"
  on public.item_consumers for delete to authenticated
  using (is_own_participant(participant_id));

-- ─── índice para buscas por auth_id (todas as policies passam por aqui) ──────

create index if not exists idx_participants_auth_id on public.participants(auth_id);
