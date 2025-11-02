-- Check if visibility column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='insights' AND column_name='visibility') THEN
    ALTER TABLE insights ADD COLUMN visibility TEXT NOT NULL DEFAULT 'subscribers';
  END IF;
END $$;

-- Update existing insights to have 'subscribers' visibility if null
UPDATE insights SET visibility = 'subscribers' WHERE visibility IS NULL OR visibility = '';

-- Create index for public insights queries if not exists
CREATE INDEX IF NOT EXISTS idx_insights_visibility ON insights(visibility);

-- Update RLS policies to allow public insights to be viewable by everyone
DROP POLICY IF EXISTS "Anyone can view public insights" ON insights;

CREATE POLICY "Anyone can view public insights"
  ON insights FOR SELECT
  USING (visibility = 'public');

-- Keep the existing subscribers policy
DROP POLICY IF EXISTS "Subscribers can view subscriber insights" ON insights;

CREATE POLICY "Subscribers can view subscriber insights"
  ON insights FOR SELECT
  USING (
    visibility = 'subscribers' AND 
    (expert_id = auth.uid() OR EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.expert_id = insights.expert_id 
      AND subscriptions.investor_id = auth.uid()
    ))
  );