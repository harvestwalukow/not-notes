create table if not exists public.noest_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"folders":[],"notes":[],"dark":false}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.noest_documents enable row level security;

drop policy if exists "Users can read their Noest document" on public.noest_documents;
create policy "Users can read their Noest document"
  on public.noest_documents for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their Noest document" on public.noest_documents;
create policy "Users can create their Noest document"
  on public.noest_documents for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their Noest document" on public.noest_documents;
create policy "Users can update their Noest document"
  on public.noest_documents for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their Noest document" on public.noest_documents;
create policy "Users can delete their Noest document"
  on public.noest_documents for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.noest_documents from anon;
grant select, insert, update, delete on public.noest_documents to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.noest_documents;
exception
  when duplicate_object then null;
end $$;
