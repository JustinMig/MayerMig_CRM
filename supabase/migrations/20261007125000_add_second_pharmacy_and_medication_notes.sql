alter table public.client_pharmacies
  add column if not exists pharmacy_name_2 text,
  add column if not exists pharmacy_location_2 text,
  add column if not exists medication_notes text;
