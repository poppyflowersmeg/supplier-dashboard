-- Switch catalog policies from exact email match to ilike to avoid
-- case-sensitivity issues with JWT claims that cause SELECT to fail
-- while INSERT...RETURNING (which bypasses SELECT RLS) still works.
drop policy "allow select" on catalog;
drop policy "allow insert" on catalog;
drop policy "allow update" on catalog;
drop policy "allow delete" on catalog;

create policy "allow select" on catalog for select to authenticated
  using (auth.jwt()->>'email' ilike '%@poppyflowers.com');

create policy "allow insert" on catalog for insert to authenticated
  with check (auth.jwt()->>'email' ilike '%@poppyflowers.com');

create policy "allow update" on catalog for update to authenticated
  using  (auth.jwt()->>'email' ilike '%@poppyflowers.com')
  with check (auth.jwt()->>'email' ilike '%@poppyflowers.com');

create policy "allow delete" on catalog for delete to authenticated
  using (auth.jwt()->>'email' ilike '%@poppyflowers.com');
