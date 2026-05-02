create extension if not exists "uuid-ossp";

create table public.users (
  id uuid references auth.users(id) primary key,
  email text not null,
  display_name text,
  photo_url text,
  phone text default '',
  role text default null check (role in ('renter', 'owner', 'driver', 'admin', null)),
  active_role text,
  has_multiple_roles boolean default false,
  roles text[] default '{}',
  location_lat double precision,
  location_lng double precision,
  location_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.users(id),
  listing_type text check (listing_type in ('rent', 'sale', 'both')),
  name text not null,
  type text check (type in ('tractor', 'harvester', 'jcb', 'excavator', 'bulldozer', 'crane')),
  brand text,
  model text,
  year integer,
  description text,
  images text[] default '{}',
  location_lat double precision,
  location_lng double precision,
  location_address text,
  location_state text,
  location_district text,
  price_per_hour numeric,
  price_per_day numeric,
  sale_price numeric,
  driver_available boolean default false,
  driver_fee_per_day numeric default 0,
  is_available boolean default true,
  booked_dates text[] default '{}',
  hp integer,
  weight text,
  fuel_type text,
  capacity text,
  rating numeric default 0,
  review_count integer default 0,
  is_verified boolean default false,
  status text default 'active' check (status in ('active', 'inactive', 'sold')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id),
  vehicle_name text,
  vehicle_image text,
  renter_id uuid references public.users(id),
  renter_name text,
  renter_phone text,
  owner_id uuid references public.users(id),
  driver_id uuid references public.users(id),
  driver_requested boolean default false,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_address text,
  total_days integer,
  price_per_day numeric,
  driver_fee numeric default 0,
  total_amount numeric,
  status text default 'pending' check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  cancellation_reason text,
  refund_amount numeric,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.drivers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) unique,
  name text,
  phone text,
  license_number text,
  license_expiry date,
  experience_years integer,
  vehicle_types text[] default '{}',
  location_lat double precision,
  location_lng double precision,
  location_address text,
  is_available boolean default true,
  current_job_id uuid references public.bookings(id),
  rating numeric default 0,
  review_count integer default 0,
  total_jobs integer default 0,
  fee_per_day numeric,
  is_verified boolean default false,
  license_url text,
  aadhar_url text,
  photo_url text,
  application_status text default 'pending' check (application_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

create table public.cart (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  vehicle_id uuid references public.vehicles(id),
  vehicle_name text,
  vehicle_image text,
  price_per_day numeric,
  driver_requested boolean default false,
  driver_fee_per_day numeric default 0,
  start_date date,
  end_date date,
  start_time time,
  total_days integer,
  total_amount numeric,
  added_at timestamptz default now()
);

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id),
  booking_id uuid references public.bookings(id),
  reviewer_id uuid references public.users(id),
  reviewer_name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id),
  sender_id uuid references public.users(id),
  sender_name text,
  sender_avatar text,
  content text,
  message_type text default 'text' check (message_type in ('text', 'image', 'voice', 'system')),
  file_url text,
  file_duration integer,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  title text,
  body text,
  type text,
  related_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_vehicles_owner_id on public.vehicles(owner_id);
create index idx_vehicles_status on public.vehicles(status);
create index idx_vehicles_type on public.vehicles(type);
create index idx_vehicles_listing_type on public.vehicles(listing_type);
create index idx_bookings_renter_id on public.bookings(renter_id);
create index idx_bookings_owner_id on public.bookings(owner_id);
create index idx_bookings_driver_id on public.bookings(driver_id);
create index idx_bookings_vehicle_id on public.bookings(vehicle_id);
create index idx_bookings_status on public.bookings(status);
create index idx_drivers_user_id on public.drivers(user_id);
create index idx_drivers_application_status on public.drivers(application_status);
create index idx_cart_user_id on public.cart(user_id);
create index idx_reviews_vehicle_id on public.reviews(vehicle_id);
create index idx_messages_booking_id on public.messages(booking_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_notifications_user_id on public.notifications(user_id);

alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.drivers enable row level security;
alter table public.cart enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Anyone can read active vehicles" on public.vehicles for select using (status = 'active');
create policy "Owners can insert vehicles" on public.vehicles for insert with check (auth.uid() = owner_id);
create policy "Owners can update own vehicles" on public.vehicles for update using (auth.uid() = owner_id);
create policy "Owners can delete own vehicles" on public.vehicles for delete using (auth.uid() = owner_id);

create policy "Renters can read own bookings" on public.bookings for select using (auth.uid() = renter_id or auth.uid() = owner_id or auth.uid() = driver_id);
create policy "Renters can create bookings" on public.bookings for insert with check (auth.uid() = renter_id);
create policy "Participants can update bookings" on public.bookings for update using (auth.uid() = renter_id or auth.uid() = owner_id);

create policy "Users own their cart" on public.cart for all using (auth.uid() = user_id);

create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Reviewers can insert" on public.reviews for insert with check (auth.uid() = reviewer_id);

create policy "Participants can read messages" on public.messages for select using (
  exists (
    select 1 from public.bookings
    where id = booking_id
      and (renter_id = auth.uid() or owner_id = auth.uid() or driver_id = auth.uid())
  )
);

create policy "Participants can send messages" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.bookings
    where id = booking_id
      and (renter_id = auth.uid() or owner_id = auth.uid() or driver_id = auth.uid())
  )
);

create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);

create policy "Anyone can read approved drivers" on public.drivers for select using (application_status = 'approved');
create policy "Drivers can insert own" on public.drivers for insert with check (auth.uid() = user_id);
create policy "Drivers can update own" on public.drivers for update using (auth.uid() = user_id);

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.bookings;

insert into public.vehicles (
  owner_id, listing_type, name, type, brand, model, year, description, images,
  location_lat, location_lng, location_address, location_state, location_district,
  price_per_hour, price_per_day, driver_available, driver_fee_per_day, is_available,
  hp, weight, fuel_type, capacity, rating, review_count, is_verified, status
) values
('00000000-0000-0000-0000-000000000001', 'rent', 'Mahindra 575 DI Tractor', 'tractor', 'Mahindra', '575 DI', 2021, '45 HP tractor ideal for paddy and wheat fields.', array['https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=600'], 13.0827, 80.2707, 'Kancheepuram, Tamil Nadu', 'Tamil Nadu', 'Kancheepuram', 350, 2800, true, 800, true, 45, '2100 kg', 'Diesel', '1.5 ton', 4.5, 12, true, 'active'),
('00000000-0000-0000-0000-000000000001', 'rent', 'John Deere 5310 Tractor', 'tractor', 'John Deere', '5310', 2022, '55 HP 4WD tractor for heavy field work.', array['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600'], 13.1827, 80.3707, 'Thiruvallur, Tamil Nadu', 'Tamil Nadu', 'Thiruvallur', 450, 3600, true, 900, true, 55, '2800 kg', 'Diesel', '2 ton', 4.7, 8, true, 'active'),
('00000000-0000-0000-0000-000000000002', 'rent', 'CLAAS Crop Tiger Harvester', 'harvester', 'CLAAS', 'Crop Tiger', 2020, 'Self-propelled combine harvester for wheat and rice.', array['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600'], 12.9716, 80.1000, 'Chengalpattu, Tamil Nadu', 'Tamil Nadu', 'Chengalpattu', 1200, 9000, true, 1200, true, 110, '8500 kg', 'Diesel', '5 ton', 4.3, 5, true, 'active'),
('00000000-0000-0000-0000-000000000002', 'both', 'JCB 3DX Backhoe Loader', 'jcb', 'JCB', '3DX', 2021, 'Versatile backhoe for digging and site preparation.', array['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'], 12.8000, 80.2200, 'Tambaram, Tamil Nadu', 'Tamil Nadu', 'Chennai', 800, 6000, true, 1000, true, 76, '7900 kg', 'Diesel', '1 ton bucket', 4.6, 15, true, 'active'),
('00000000-0000-0000-0000-000000000001', 'rent', 'Eicher 380 Mini Tractor', 'tractor', 'Eicher', '380', 2023, 'Compact 38 HP tractor for small farms.', array['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'], 13.3000, 80.1500, 'Ponneri, Tamil Nadu', 'Tamil Nadu', 'Thiruvallur', 250, 2000, false, 0, true, 38, '1800 kg', 'Diesel', '1 ton', 4.2, 3, false, 'active'),
('00000000-0000-0000-0000-000000000002', 'sale', 'Caterpillar 320 Excavator', 'excavator', 'Caterpillar', '320', 2019, '20-ton excavator for heavy earthmoving.', array['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600'], 13.0500, 80.2500, 'Ambattur, Tamil Nadu', 'Tamil Nadu', 'Chennai', null, null, false, 0, true, 158, '20000 kg', 'Diesel', '1.2 m³ bucket', 4.4, 2, true, 'active');
