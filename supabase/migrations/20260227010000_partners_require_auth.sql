-- Replace anon policies with authenticated-only policies restricted to @poppyflowers.com
drop policy "allow select" on partners;
drop policy "allow insert" on partners;
drop policy "allow update" on partners;

create policy "allow select"
  on partners for select to authenticated
  using (auth.jwt()->>'email' ilike '%@poppyflowers.com');

create policy "allow insert"
  on partners for insert to authenticated
  with check (auth.jwt()->>'email' ilike '%@poppyflowers.com');

create policy "allow update"
  on partners for update to authenticated
  using  (auth.jwt()->>'email' ilike '%@poppyflowers.com')
  with check (auth.jwt()->>'email' ilike '%@poppyflowers.com');
