import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Bell, Users, FileText, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newInsight, setNewInsight] = useState({ title: "", content: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "" });
  const [pricingData, setPricingData] = useState<{ fee: number; duration: "free" | "monthly" | "quarterly" | "yearly" }>({ fee: 0, duration: "monthly" });

  useEffect(() => {
    loadDashboardData();
    
    // Set up realtime subscriptions
    const subscribersChannel = supabase
      .channel('subscriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        loadSubscribers();
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData?.user_type !== "expert") {
        navigate("/investor/dashboard");
        return;
      }

      setProfile(profileData);
      setProfileData({ name: profileData.name, bio: profileData.bio || "" });

      // Load expert profile
      const { data: expertData } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setExpertProfile(expertData);
      setPricingData({
        fee: expertData?.subscription_fee || 0,
        duration: (expertData?.subscription_duration || "monthly") as "free" | "monthly" | "quarterly" | "yearly",
      });

      await loadSubscribers();
      await loadInsights();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("*, profiles!subscriptions_investor_id_fkey(*)")
      .eq("expert_id", user.id);

    setSubscribers(data || []);
  };

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("insights")
      .select("*")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false });

    setInsights(data || []);
  };

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setNotifications(data || []);
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ name: profileData.name, bio: profileData.bio })
        .eq("user_id", user.id);

      toast.success("Profile updated successfully");
      setEditingProfile(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdatePricing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("expert_profiles")
        .update({
          subscription_fee: pricingData.fee,
          subscription_duration: pricingData.duration,
        })
        .eq("user_id", user.id);

      toast.success("Pricing updated successfully");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePublishInsight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!newInsight.title || !newInsight.content) {
        toast.error("Please fill in all fields");
        return;
      }

      await supabase.from("insights").insert({
        expert_id: user.id,
        title: newInsight.title,
        content: newInsight.content,
      });

      // Notify all subscribers
      subscribers.forEach(async (sub) => {
        await supabase.from("notifications").insert({
          user_id: sub.investor_id,
          type: "new_insight",
          message: `${profile?.name} published a new insight: ${newInsight.title}`,
        });
      });

      toast.success("Insight published successfully");
      setNewInsight({ title: "", content: "" });
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Expert Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
                )}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{subscribers.length}</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Insights Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{insights.length}</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Subscription Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${expertProfile?.subscription_fee || 0}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {expertProfile?.subscription_duration || "monthly"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Profile Section */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your expert profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.image_url} />
                      <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.name}</p>
                      <p className="text-sm text-muted-foreground">{profile?.bio || "No bio yet"}</p>
                    </div>
                  </div>
                  <Button onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Pricing Settings</CardTitle>
              <CardDescription>Set your subscription pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subscription Fee ($)</Label>
                <Input
                  type="number"
                  value={pricingData.fee}
                  onChange={(e) => setPricingData({ ...pricingData, fee: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Select
                  value={pricingData.duration}
                  onValueChange={(value) => setPricingData({ ...pricingData, duration: value as "free" | "monthly" | "quarterly" | "yearly" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdatePricing}>Update Pricing</Button>
            </CardContent>
          </Card>
        </div>

        {/* Publish Insight */}
        <Card className="card-shadow mt-6">
          <CardHeader>
            <CardTitle>Publish New Insight</CardTitle>
            <CardDescription>Share your expertise with subscribers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newInsight.title}
                onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
                placeholder="Market Analysis: Tech Stocks Q1 2025"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={newInsight.content}
                onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                rows={6}
                placeholder="Share your investment insights..."
              />
            </div>
            <Button onClick={handlePublishInsight}>Publish Insight</Button>
          </CardContent>
        </Card>

        {/* Recent Insights */}
        <Card className="card-shadow mt-6">
          <CardHeader>
            <CardTitle>Your Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-muted-foreground">No insights published yet</p>
            ) : (
              <div className="space-y-4">
                {insights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="border-b border-border pb-4 last:border-0">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{insight.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscribers List */}
        <Card className="card-shadow mt-6">
          <CardHeader>
            <CardTitle>Your Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <p className="text-muted-foreground">No subscribers yet</p>
            ) : (
              <div className="space-y-3">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={sub.profiles?.image_url} />
                      <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{sub.profiles?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Subscribed {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertDashboard;
