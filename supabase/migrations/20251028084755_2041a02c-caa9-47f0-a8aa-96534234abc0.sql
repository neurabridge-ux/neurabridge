-- Fix search_path for notification functions

-- Update notify_expert_on_subscription_request function with proper search_path
DROP FUNCTION IF EXISTS notify_expert_on_subscription_request() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_expert_on_subscription_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  investor_name text;
BEGIN
  SELECT name INTO investor_name
  FROM public.profiles
  WHERE user_id = NEW.investor_id;
  
  INSERT INTO public.notifications (user_id, type, message, related_id, action_type)
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
  AFTER INSERT ON public.subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expert_on_subscription_request();

-- Update notify_investor_on_request_response function with proper search_path
DROP FUNCTION IF EXISTS notify_investor_on_request_response() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_investor_on_request_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expert_name text;
BEGIN
  IF NEW.status != OLD.status THEN
    SELECT name INTO expert_name
    FROM public.profiles
    WHERE user_id = NEW.expert_id;
    
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, message, related_id, action_type)
      VALUES (
        NEW.investor_id,
        'Enrollment Approved',
        expert_name || ' has approved your enrollment request',
        NEW.expert_id,
        'request_approved'
      );
      
      -- Auto-create subscription
      INSERT INTO public.subscriptions (investor_id, expert_id)
      VALUES (NEW.investor_id, NEW.expert_id)
      ON CONFLICT DO NOTHING;
      
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (user_id, type, message, related_id, action_type)
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
  AFTER UPDATE ON public.subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_investor_on_request_response();