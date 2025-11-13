-- Fix security warnings by setting search_path on functions

CREATE OR REPLACE FUNCTION public.validate_exam_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.exam_date < CURRENT_DATE + INTERVAL '14 days' THEN
    RAISE EXCEPTION 'A data da prova deve ter pelo menos 14 dias de antecedência';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;