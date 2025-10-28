-- Add views and likes tracking for insights
ALTER TABLE insights ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE insights ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Create insight_likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS insight_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(insight_id, user_id)
);

-- Enable RLS on insight_likes
ALTER TABLE insight_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for insight_likes
CREATE POLICY "Anyone can view likes"
  ON insight_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like insights"
  ON insight_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike insights"
  ON insight_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create subscription_requests table
CREATE TABLE IF NOT EXISTS subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(investor_id, expert_id)
);

-- Enable RLS on subscription_requests
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_requests
CREATE POLICY "Users can view their own requests"
  ON subscription_requests FOR SELECT
  USING (auth.uid() = investor_id OR auth.uid() = expert_id);

CREATE POLICY "Investors can create requests"
  ON subscription_requests FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Experts can update requests"
  ON subscription_requests FOR UPDATE
  USING (auth.uid() = expert_id);

-- Add market_category and posting_frequency to expert_profiles
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS market_category text;
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS posting_frequency text DEFAULT 'weekly';

-- Function to notify on likes
CREATE OR REPLACE FUNCTION notify_expert_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  insight_expert_id uuid;
  liker_name text;
BEGIN
  -- Get the expert who wrote the insight
  SELECT expert_id INTO insight_expert_id
  FROM insights
  WHERE id = NEW.insight_id;
  
  -- Get liker name
  SELECT name INTO liker_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- Notify expert if like is not from themselves
  IF insight_expert_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, message, related_id, action_type)
    VALUES (
      insight_expert_id,
      'New Like',
      liker_name || ' liked your insight',
      NEW.insight_id,
      'new_like'
    );
  END IF;
  
  -- Update likes count
  UPDATE insights SET likes_count = likes_count + 1 WHERE id = NEW.insight_id;
  
  RETURN NEW;
END;
$function$;

-- Trigger for likes
CREATE TRIGGER on_insight_liked
  AFTER INSERT ON insight_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_expert_on_like();

-- Function to decrement likes count on unlike
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE insights SET likes_count = likes_count - 1 WHERE id = OLD.insight_id;
  RETURN OLD;
END;
$function$;

-- Trigger for unlikes
CREATE TRIGGER on_insight_unliked
  AFTER DELETE ON insight_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();