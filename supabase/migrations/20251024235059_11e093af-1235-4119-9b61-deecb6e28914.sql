-- Create enum for user types
CREATE TYPE user_type AS ENUM ('expert', 'investor');

-- Create enum for subscription duration
CREATE TYPE subscription_duration AS ENUM ('monthly', 'quarterly', 'yearly', 'free');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type user_type NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create expert_profiles table
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_fee DECIMAL(10,2) DEFAULT 0,
  subscription_duration subscription_duration DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on expert_profiles
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for expert_profiles
CREATE POLICY "Anyone can view expert profiles"
  ON expert_profiles FOR SELECT
  USING (true);

CREATE POLICY "Experts can insert their own profile"
  ON expert_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update their own profile"
  ON expert_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create investor_profiles table
CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  investment_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on investor_profiles
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for investor_profiles
CREATE POLICY "Users can view their own investor profile"
  ON investor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Investors can insert their own profile"
  ON investor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Investors can update their own profile"
  ON investor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies for insights
CREATE POLICY "Anyone can view insights"
  ON insights FOR SELECT
  USING (true);

CREATE POLICY "Experts can insert their own insights"
  ON insights FOR INSERT
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their own insights"
  ON insights FOR UPDATE
  USING (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own insights"
  ON insights FOR DELETE
  USING (auth.uid() = expert_id);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(investor_id, expert_id)
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = investor_id OR auth.uid() = expert_id);

CREATE POLICY "Investors can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = investor_id);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID REFERENCES insights(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  USING (true);

CREATE POLICY "Experts can insert their own testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own testimonials"
  ON testimonials FOR DELETE
  USING (auth.uid() = expert_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, user_type, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'investor')::user_type,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE insights;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;