alter table partners
  add column name         text not null default '',
  add column partner_type text not null default '',
  add column min          text,
  add column tags         jsonb not null default '[]',
  add column warnings     text not null default '',
  add column notes        text not null default '';
