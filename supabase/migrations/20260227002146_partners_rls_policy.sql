alter table partners enable row level security;

create policy "allow all"
  on partners
  for all
  to anon
  using (true)
  with check (true);
