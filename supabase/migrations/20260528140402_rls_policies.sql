create policy "rooms_select"
on public.rooms
for select
using (true);

create policy "rooms_insert"
on public.rooms
for insert
with check (auth.uid() = host_auth_id);

create policy "participants_select"
on public.participants
for select
using (true);

create policy "participants_insert"
on public.participants
for insert
with check (auth.uid() = auth_id);

create policy "items_select"
on public.items
for select
using (true);

create policy "items_insert"
on public.items
for insert
with check (
    exists (
        select 1
        from public.participants p
        where p.id = created_by
    )
);

create policy "item_consumers_select"
on public.item_consumers
for select
using (true);

create policy "item_consumers_insert"
on public.item_consumers
for insert
with check (
    exists (
        select 1
        from public.participants p
        where p.id = participant_id
    )
);

create policy "item_consumers_delete"
on public.item_consumers
for delete
using (
    exists (
        select 1
        from public.participants p
        where p.id = participant_id
          and p.auth_id = auth.uid()
    )
);

create policy "suggestions_select"
on public.suggestions
for select
using (true);

create policy "suggestions_insert"
on public.suggestions
for insert
with check (true);