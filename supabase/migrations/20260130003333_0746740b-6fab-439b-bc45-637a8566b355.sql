-- Fix search_path for functions that are missing it
CREATE OR REPLACE FUNCTION public.calculate_payout_date(event_date DATE)
RETURNS DATE
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  result_date DATE := event_date;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < 3 LOOP
    result_date := result_date + 1;
    -- Skip weekends (0 = Sunday, 6 = Saturday)
    IF EXTRACT(DOW FROM result_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  RETURN result_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_payout_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.payout_date := public.calculate_payout_date(NEW.event_date);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;