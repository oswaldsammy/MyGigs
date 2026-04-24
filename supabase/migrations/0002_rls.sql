-- Row Level Security
alter table public.users enable row level security;
alter table public.musician_profiles enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.bookings enable row level security;
alter table public.quotes enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- users: self read/write, public read of basic fields
create policy "users self read" on public.users
  for select using (auth.uid() = id);
create policy "users public read" on public.users
  for select using (true);
create policy "users self insert" on public.users
  for insert with check (auth.uid() = id);
create policy "users self update" on public.users
  for update using (auth.uid() = id);

-- musician_profiles: public read, owner write
create policy "musician_profiles public read" on public.musician_profiles
  for select using (true);
create policy "musician_profiles owner insert" on public.musician_profiles
  for insert with check (auth.uid() = id);
create policy "musician_profiles owner update" on public.musician_profiles
  for update using (auth.uid() = id);

-- kyc_documents: only owner musician
create policy "kyc owner read" on public.kyc_documents
  for select using (auth.uid() = musician_id);
create policy "kyc owner insert" on public.kyc_documents
  for insert with check (auth.uid() = musician_id);
create policy "kyc owner update" on public.kyc_documents
  for update using (auth.uid() = musician_id);

-- bookings: client or musician party only
create policy "bookings party read" on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = musician_id);
create policy "bookings client insert" on public.bookings
  for insert with check (auth.uid() = client_id);
create policy "bookings party update" on public.bookings
  for update using (auth.uid() = client_id or auth.uid() = musician_id);

-- quotes: musician owner writes; both parties of booking read
create policy "quotes party read" on public.quotes
  for select using (
    auth.uid() = musician_id
    or exists (
      select 1 from public.bookings b
      where b.id = quotes.booking_id and b.client_id = auth.uid()
    )
  );
create policy "quotes musician insert" on public.quotes
  for insert with check (auth.uid() = musician_id);
create policy "quotes musician update" on public.quotes
  for update using (auth.uid() = musician_id);

-- messages: only booking parties
create policy "messages party read" on public.messages
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
        and (b.client_id = auth.uid() or b.musician_id = auth.uid())
    )
  );
create policy "messages party insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.client_id = auth.uid() or b.musician_id = auth.uid())
    )
  );
create policy "messages party update" on public.messages
  for update using (
    exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
        and (b.client_id = auth.uid() or b.musician_id = auth.uid())
    )
  );

-- reviews: public read, client of booking writes
create policy "reviews public read" on public.reviews
  for select using (true);
create policy "reviews client insert" on public.reviews
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid() and b.status = 'completed'
    )
  );
create policy "reviews musician response" on public.reviews
  for update using (auth.uid() = musician_id or auth.uid() = client_id);

-- notifications: owner only
create policy "notifications owner read" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications owner update" on public.notifications
  for update using (auth.uid() = user_id);
