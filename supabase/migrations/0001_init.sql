-- MyGigs initial schema
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('client', 'musician');
create type kyc_status as enum ('pending', 'submitted', 'approved', 'rejected');
create type kyc_doc_type as enum ('id', 'certificate', 'portfolio', 'bank');
create type kyc_doc_status as enum ('pending', 'approved', 'rejected');
create type booking_status as enum ('pending', 'accepted', 'declined', 'negotiating', 'confirmed', 'completed', 'cancelled');
create type payment_status as enum ('unpaid', 'held', 'released', 'refunded');
create type quote_status as enum ('pending', 'accepted', 'declined', 'expired');

-- users (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  created_at timestamptz not null default now()
);

-- musician_profiles
create table public.musician_profiles (
  id uuid primary key references public.users(id) on delete cascade,
  bio text,
  genres text[],
  instruments text[],
  languages text[],
  hourly_rate numeric,
  min_booking_hours int,
  is_verified boolean not null default false,
  kyc_status kyc_status not null default 'pending',
  profile_video_url text,
  sample_tracks jsonb,
  availability jsonb,
  avg_rating numeric,
  total_reviews int not null default 0,
  is_active boolean not null default true
);

-- kyc_documents
create table public.kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  musician_id uuid not null references public.musician_profiles(id) on delete cascade,
  doc_type kyc_doc_type not null,
  file_url text not null,
  status kyc_doc_status not null default 'pending',
  reviewed_at timestamptz
);

-- bookings
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.users(id) on delete cascade,
  musician_id uuid not null references public.musician_profiles(id) on delete cascade,
  event_date date not null,
  start_time time not null,
  duration_hours numeric not null,
  venue_name text,
  venue_address text,
  event_type text,
  special_requests text,
  decline_reason text,
  status booking_status not null default 'pending',
  total_amount numeric,
  platform_fee numeric,
  musician_payout numeric,
  payment_status payment_status not null default 'unpaid',
  payment_reference text,
  contract_url text,
  created_at timestamptz not null default now()
);

-- quotes
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  musician_id uuid not null references public.musician_profiles(id) on delete cascade,
  amount numeric not null,
  message text,
  expires_at timestamptz,
  status quote_status not null default 'pending'
);

-- messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  file_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  musician_id uuid not null references public.musician_profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text,
  musician_response text,
  created_at timestamptz not null default now()
);

-- notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index on public.bookings (client_id);
create index on public.bookings (musician_id);
create index on public.messages (booking_id);
create index on public.notifications (user_id, is_read);
create index on public.reviews (musician_id);
