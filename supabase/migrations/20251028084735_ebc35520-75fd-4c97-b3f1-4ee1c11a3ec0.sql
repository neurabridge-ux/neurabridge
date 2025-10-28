-- Add notification triggers for subscription requests

-- Notify expert when investor sends subscription request
CREATE OR REPLACE FUNCTION notify_expert_on_subscription_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  investor_name text;
BEGIN
  SELECT name INTO investor_name
  FROM profiles
  WHERE user_id = NEW.investor_id;
  
  INSERT INTO notifications (user_id, type, message, related_id, action_type)
  VALUES (
    NEW.expert_id,
    'Subscription Request',
    investor_name || ' has requested to enroll in your subscription',
    NEW.id,
    'subscription_request'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_subscription_request_created
  AFTER INSERT ON subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_expert_on_subscription_request();

-- Notify investor when expert approves or declines request
CREATE OR REPLACE FUNCTION notify_investor_on_request_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expert_name text;
BEGIN
  IF NEW.status != OLD.status THEN
    SELECT name INTO expert_name
    FROM profiles
    WHERE user_id = NEW.expert_id;
    
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, type, message, related_id, action_type)
      VALUES (
        NEW.investor_id,
        'Enrollment Approved',
        expert_name || ' has approved your enrollment request',
        NEW.expert_id,
        'request_approved'
      );
      
      -- Auto-create subscription
      INSERT INTO subscriptions (investor_id, expert_id)
      VALUES (NEW.investor_id, NEW.expert_id)
      ON CONFLICT DO NOTHING;
      
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO notifications (user_id, type, message, related_id, action_type)
      VALUES (
        NEW.investor_id,
        'Enrollment Declined',
        expert_name || ' has declined your enrollment request',
        NEW.expert_id,
        'request_declined'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_subscription_request_updated
  AFTER UPDATE ON subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_investor_on_request_response();