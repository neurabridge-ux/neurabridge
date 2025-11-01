-- Add visibility field to insights table
ALTER TABLE insights ADD COLUMN visibility text NOT NULL DEFAULT 'subscribers';

-- Add check constraint for visibility values
ALTER TABLE insights ADD CONSTRAINT insights_visibility_check 
  CHECK (visibility IN ('subscribers', 'public'));

-- Create index for faster filtering by visibility
CREATE INDEX idx_insights_visibility ON insights(visibility);

-- Update RLS policy to allow public insights to be viewed by everyone
DROP POLICY IF EXISTS "Anyone can view insights" ON insights;

CREATE POLICY "Anyone can view public insights" 
ON insights 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Subscribers can view subscriber insights" 
ON insights 
FOR SELECT 
USING (
  visibility = 'subscribers' 
  AND (
    expert_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.expert_id = insights.expert_id 
      AND subscriptions.investor_id = auth.uid()
    )
  )
);