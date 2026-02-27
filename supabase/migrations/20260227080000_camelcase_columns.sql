-- Rename suppliers columns to camelCase to match TypeScript interfaces
ALTER TABLE suppliers RENAME COLUMN partner_type TO "supplierType";
ALTER TABLE suppliers RENAME COLUMN min TO "boxMin";
ALTER TABLE suppliers RENAME COLUMN lead_time TO "leadTime";
ALTER TABLE suppliers RENAME COLUMN contact_email TO "contactEmail";

-- Rename catalog_items columns to camelCase
ALTER TABLE catalog_items RENAME COLUMN supplier_id TO "supplierId";
