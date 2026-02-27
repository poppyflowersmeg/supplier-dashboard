-- Reads: any @poppyflowers.com authenticated user
-- Writes (insert/update/delete): meg@poppyflowers.com only

-- partners
drop policy "allow insert" on partners;
drop policy "allow update" on partners;
drop policy "allow delete" on partners;

create policy "allow insert" on partners for insert to authenticated
  with check (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');

create policy "allow update" on partners for update to authenticated
  using  (auth.jwt()->>'email' ilike 'meg@poppyflowers.com')
  with check (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');

create policy "allow delete" on partners for delete to authenticated
  using (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');

-- catalog
drop policy "allow insert" on catalog;
drop policy "allow update" on catalog;
drop policy "allow delete" on catalog;

create policy "allow insert" on catalog for insert to authenticated
  with check (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');

create policy "allow update" on catalog for update to authenticated
  using  (auth.jwt()->>'email' ilike 'meg@poppyflowers.com')
  with check (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');

create policy "allow delete" on catalog for delete to authenticated
  using (auth.jwt()->>'email' ilike 'meg@poppyflowers.com');
