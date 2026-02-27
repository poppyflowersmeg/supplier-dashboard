-- Replace the permissive "allow all" policy with explicit per-operation policies
drop policy "allow all" on partners;

create policy "allow select" on partners for select to anon using (true);
create policy "allow insert" on partners for insert to anon with check (true);
create policy "allow update" on partners for update to anon using (true) with check (true);
-- No delete policy — anon users cannot delete rows
