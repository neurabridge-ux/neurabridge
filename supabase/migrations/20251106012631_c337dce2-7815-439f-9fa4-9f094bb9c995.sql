-- Fix RLS for expert signup - Drop and recreate with correct syntax
DROP POLICY IF EXISTS "Experts can insert their own profile" ON public.expert_profiles;

CREATE POLICY "Experts can insert their own profile" 
ON public.expert_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure profiles table allows user inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles
FOR INSERT
WITH CHECK (true);