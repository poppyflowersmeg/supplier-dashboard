-- Widen partners SELECT from meg-only to any @poppyflowers.com account
drop policy "allow select" on partners;

create policy "allow select" on partners for select to authenticated
  using (auth.jwt()->>'email' ilike '%@poppyflowers.com');
