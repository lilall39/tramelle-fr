-- Phase 4 : type Objet / Argent, dates de prêt et de retour, valeur d’objet optionnelle.

alter table public.loans
  add column if not exists loan_kind text not null default 'object'
  check (loan_kind in ('object', 'money'));

alter table public.loans
  add column if not exists loan_date date;

update public.loans
set loan_date = (created_at at time zone 'utc')::date
where loan_date is null;

alter table public.loans
  alter column loan_date set default ((timezone('utc', now())))::date;

alter table public.loans
  alter column loan_date set not null;

alter table public.loans
  add column if not exists expected_return_date date;

alter table public.loans
  add column if not exists item_value numeric;

alter table public.loans
  alter column item_name drop not null;

update public.loans
set
  item_value = case
    when loan_kind = 'object' and amount is not null then amount
    else item_value
  end,
  amount = case
    when loan_kind = 'object' then null
    else amount
  end,
  expected_return_date = coalesce(
    expected_return_date,
    case when reminder_at is not null then (reminder_at at time zone 'utc')::date else null end
  );

create index if not exists loans_user_loan_date_idx on public.loans (user_id, loan_date desc);
