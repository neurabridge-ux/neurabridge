-- Add expectations field to expert_profiles
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS expectations text;

-- Change market_category to array type for multiple categories
ALTER TABLE expert_profiles 
DROP COLUMN IF EXISTS market_category CASCADE;

ALTER TABLE expert_profiles 
ADD COLUMN market_categories text[] DEFAULT '{}';

-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  item_type text NOT NULL CHECK (item_type IN ('Course', 'Training', 'Service', 'Opportunity')),
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on marketplace_items
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_items
CREATE POLICY "Anyone can view marketplace items"
ON marketplace_items FOR SELECT
USING (true);

CREATE POLICY "Experts can insert their own items"
ON marketplace_items FOR INSERT
WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their own items"
ON marketplace_items FOR UPDATE
USING (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own items"
ON marketplace_items FOR DELETE
USING (auth.uid() = expert_id);

-- Create function to notify subscribers when marketplace item is added
CREATE OR REPLACE FUNCTION notify_subscribers_on_new_marketplace_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, message, related_id, action_type)
  SELECT 
    s.investor_id,
    'New Marketplace Item',
    (SELECT name FROM profiles WHERE user_id = NEW.expert_id) || ' added a new ' || NEW.item_type || ': ' || NEW.title,
    NEW.id,
    'new_marketplace_item'
  FROM subscriptions s
  WHERE s.expert_id = NEW.expert_id;
  
  RETURN NEW;
END;
$$;

-- Trigger for marketplace item notifications
DROP TRIGGER IF EXISTS on_marketplace_item_created ON marketplace_items;
CREATE TRIGGER on_marketplace_item_created
  AFTER INSERT ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_on_new_marketplace_item();

-- Add updated_at trigger for marketplace_items
CREATE OR REPLACE FUNCTION update_marketplace_items_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_marketplace_items_updated_at_trigger ON marketplace_items;
CREATE TRIGGER update_marketplace_items_updated_at_trigger
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_items_updated_at();