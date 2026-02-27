-- Add special freight columns for Roses and Hydrangea
ALTER TABLE public.suppliers
  ADD COLUMN "freightRosesHBAvg" DOUBLE PRECISION,
  ADD COLUMN "freightRosesQBAvg" DOUBLE PRECISION,
  ADD COLUMN "freightHydrangeaQBAvg" DOUBLE PRECISION,
  ADD COLUMN "freightHydrangeaEBAvg" DOUBLE PRECISION;
