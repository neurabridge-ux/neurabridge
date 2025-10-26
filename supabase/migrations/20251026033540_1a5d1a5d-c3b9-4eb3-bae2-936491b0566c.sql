-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('insight-images', 'insight-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('testimonial-images', 'testimonial-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Storage policies for insight images
CREATE POLICY "Anyone can view insight images"
ON storage.objects FOR SELECT
USING (bucket_id = 'insight-images');

CREATE POLICY "Authenticated users can upload insight images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'insight-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own insight images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'insight-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own insight images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'insight-images' 
  AND auth.role() = 'authenticated'
);

-- Storage policies for testimonial images
CREATE POLICY "Anyone can view testimonial images"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-images');

CREATE POLICY "Authenticated users can upload testimonial images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonial-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own testimonial images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'testimonial-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own testimonial images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'testimonial-images' 
  AND auth.role() = 'authenticated'
);

-- Update notifications table to support more notification types
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id uuid;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type text;

-- Create policy for inserting notifications (system can create them)
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Add image_url column to insights if not exists
ALTER TABLE insights ADD COLUMN IF NOT EXISTS image_url text;

-- Add video_url to testimonials for video links
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS video_url text;

-- Update testimonials media_type to allow 'video'
ALTER TABLE testimonials ALTER COLUMN media_type DROP NOT NULL;

-- Create function to notify subscribers when expert posts insight
CREATE OR REPLACE FUNCTION notify_subscribers_on_new_insight()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, message, related_id, action_type)
  SELECT 
    s.investor_id,
    'New Insight',
    (SELECT name FROM profiles WHERE user_id = NEW.expert_id) || ' published a new insight: ' || NEW.title,
    NEW.id,
    'new_insight'
  FROM subscriptions s
  WHERE s.expert_id = NEW.expert_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new insights
DROP TRIGGER IF EXISTS on_new_insight_notify_subscribers ON insights;
CREATE TRIGGER on_new_insight_notify_subscribers
  AFTER INSERT ON insights
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_on_new_insight();

-- Create function to notify expert on new comment
CREATE OR REPLACE FUNCTION notify_expert_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  insight_expert_id uuid;
  commenter_name text;
BEGIN
  -- Get the expert who wrote the insight
  SELECT expert_id INTO insight_expert_id
  FROM insights
  WHERE id = NEW.insight_id;
  
  -- Get commenter name
  SELECT name INTO commenter_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- Notify expert if comment is not from themselves
  IF insight_expert_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, message, related_id, action_type)
    VALUES (
      insight_expert_id,
      'New Comment',
      commenter_name || ' commented on your insight',
      NEW.insight_id,
      'new_comment'
    );
  END IF;
  
  -- Notify parent comment author if this is a reply
  IF NEW.parent_comment_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, message, related_id, action_type)
    SELECT 
      c.user_id,
      'Comment Reply',
      commenter_name || ' replied to your comment',
      NEW.insight_id,
      'comment_reply'
    FROM comments c
    WHERE c.id = NEW.parent_comment_id
      AND c.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS on_new_comment_notify ON comments;
CREATE TRIGGER on_new_comment_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_expert_on_comment();

-- Create function to notify expert on new subscriber
CREATE OR REPLACE FUNCTION notify_expert_on_new_subscriber()
RETURNS TRIGGER AS $$
DECLARE
  investor_name text;
BEGIN
  SELECT name INTO investor_name
  FROM profiles
  WHERE user_id = NEW.investor_id;
  
  INSERT INTO notifications (user_id, type, message, related_id, action_type)
  VALUES (
    NEW.expert_id,
    'New Subscriber',
    investor_name || ' subscribed to your insights',
    NEW.investor_id,
    'new_subscriber'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new subscriptions
DROP TRIGGER IF EXISTS on_new_subscription_notify_expert ON subscriptions;
CREATE TRIGGER on_new_subscription_notify_expert
  AFTER INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_expert_on_new_subscriber();