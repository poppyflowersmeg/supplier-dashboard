alter table partners
  rename column tags     to specialties;

alter table partners
  rename column warnings to limitations;

alter table partners
  add column lead_time     text not null default '',
  add column contact_email text not null default '',
  add column phone         text not null default '';
