ALTER TABLE catalog_items RENAME COLUMN notes TO "supplierNotes";
ALTER TABLE catalog_items ADD COLUMN "poppyNotes" text not null default '';
ALTER TABLE catalog_items RENAME TO "catalogItems";
