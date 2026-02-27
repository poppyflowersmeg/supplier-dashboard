-- Replace single freightPerStemAvg with box-size variants
ALTER TABLE public.suppliers
  ADD COLUMN "freightPerStemBoxAvg" DOUBLE PRECISION,
  ADD COLUMN "freightPerStemHBAvg" DOUBLE PRECISION,
  ADD COLUMN "freightPerStemQBAvg" DOUBLE PRECISION,
  ADD COLUMN "freightPerStemEBAvg" DOUBLE PRECISION;

-- Migrate existing data to Box column
UPDATE public.suppliers
  SET "freightPerStemBoxAvg" = "freightPerStemAvg"
  WHERE "freightPerStemAvg" IS NOT NULL;

ALTER TABLE public.suppliers DROP COLUMN "freightPerStemAvg";
