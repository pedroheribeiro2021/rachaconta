create policy "rooms_select"
on public.rooms
for select
to authenticated
using (true);

create policy "rooms_insert"
on public.rooms
for insert
to authenticated
with check (true);

create policy "participants_select"
on public.participants
for select
to authenticated
using (true);

create policy "participants_insert"
on public.participants
for insert
to authenticated
with check (true);

create policy "items_select"
on public.items
for select
to authenticated
using (true);

create policy "items_insert"
on public.items
for insert
to authenticated
with check (true);

create policy "items_update"
on public.items
for update
to authenticated
using (true)
with check (true);

create policy "items_delete"
on public.items
for delete
to authenticated
using (true);

create policy "item_consumers_select"
on public.item_consumers
for select
to authenticated
using (true);

create policy "item_consumers_insert"
on public.item_consumers
for insert
to authenticated
with check (true);

create policy "item_consumers_delete"
on public.item_consumers
for delete
to authenticated
using (true);
