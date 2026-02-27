-- Allow @poppyflowers.com authenticated users to delete partners
create policy "allow delete"
  on partners for delete to authenticated
  using (auth.jwt()->>'email' ilike '%@poppyflowers.com');
