-- Add processing_fee column to events table
ALTER TABLE public.events ADD COLUMN processing_fee numeric NOT NULL DEFAULT 0;