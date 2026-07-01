-- Permite que o host da mesa edite a taxa de servico (rooms.service_fee_percent).
-- Antes desta migration nao havia policy de update em rooms (deny por padrao),
-- entao o UPDATE de update-room-service-fee.ts falharia com RLS violation.

alter table public.rooms
  add constraint rooms_service_fee_percent_check
  check (service_fee_percent >= 0 and service_fee_percent <= 100);

create policy "rooms_update"
  on public.rooms for update to authenticated
  using (host_auth_id = auth.uid()::text)
  with check (host_auth_id = auth.uid()::text);
