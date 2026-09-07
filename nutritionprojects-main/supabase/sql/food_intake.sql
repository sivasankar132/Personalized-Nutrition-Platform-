-- Check whether the table already exists before creating it.
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'food_intake'
) AS food_intake_exists;

-- Create the table only if it does not already exist.
CREATE TABLE IF NOT EXISTS public.food_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name text,
  serving_size text,
  calories_kcal numeric,
  protein_g numeric,
  carbohydrates_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  vitamin_a_mcg numeric,
  vitamin_c_mg numeric,
  vitamin_d_mcg numeric,
  vitamin_e_mg numeric,
  vitamin_k_mcg numeric,
  vitamin_b1_mg numeric,
  vitamin_b2_mg numeric,
  vitamin_b3_mg numeric,
  vitamin_b6_mg numeric,
  folate_mcg numeric,
  vitamin_b12_mcg numeric,
  calcium_mg numeric,
  iron_mg numeric,
  magnesium_mg numeric,
  potassium_mg numeric,
  zinc_mg numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: helpful index for today's totals filtering.
CREATE INDEX IF NOT EXISTS idx_food_intake_created_at
  ON public.food_intake (created_at);
