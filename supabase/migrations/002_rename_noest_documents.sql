do $$
begin
  if to_regclass('public.noest_documents') is not null
    and to_regclass('public.not_notes_documents') is null then
    alter table public.noest_documents rename to not_notes_documents;
  end if;
end $$;

alter table if exists public.not_notes_documents enable row level security;

drop policy if exists "Users can read their Noest document" on public.not_notes_documents;
drop policy if exists "Users can create their Noest document" on public.not_notes_documents;
drop policy if exists "Users can update their Noest document" on public.not_notes_documents;
drop policy if exists "Users can delete their Noest document" on public.not_notes_documents;
drop policy if exists "Users can read their Not Notes document" on public.not_notes_documents;
drop policy if exists "Users can create their Not Notes document" on public.not_notes_documents;
drop policy if exists "Users can update their Not Notes document" on public.not_notes_documents;
drop policy if exists "Users can delete their Not Notes document" on public.not_notes_documents;

create policy "Users can read their Not Notes document"
  on public.not_notes_documents for select to authenticated
  using (auth.uid() = user_id);
create policy "Users can create their Not Notes document"
  on public.not_notes_documents for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can update their Not Notes document"
  on public.not_notes_documents for update to authenticated
  using (auth.uid() = user_id);
create policy "Users can delete their Not Notes document"
  on public.not_notes_documents for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.not_notes_documents from anon;
grant select, insert, update, delete on public.not_notes_documents to authenticated;
