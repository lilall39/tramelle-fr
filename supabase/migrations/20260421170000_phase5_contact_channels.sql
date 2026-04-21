-- Phase 5 : stocker les canaux de relance par personne (email, téléphone).

alter table public.loans
  add column if not exists person_email text;

alter table public.loans
  add column if not exists person_phone text;
