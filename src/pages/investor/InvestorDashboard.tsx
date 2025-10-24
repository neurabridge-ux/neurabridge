import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Bell, Users, Search, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "", investment_goal: "" });
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDashboardData();

    // Set up realtime subscriptions
    const insightsChannel = supabase
      .channel('insights-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'insights' }, () => {
        loadInsights();
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(insightsChannel);
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

      if (profileData?.user_type !== "investor") {
        navigate("/expert/dashboard");
        return;
      }

      setProfile(profileData);

      // Load investor profile
      const { data: investorData } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setInvestorProfile(investorData);
      setProfileData({
        name: profileData.name,
        bio: profileData.bio || "",
        investment_goal: investorData?.investment_goal || "",
      });

      await loadSubscriptions();
      await loadInsights();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("*, profiles!subscriptions_expert_id_fkey(*), expert_profiles!inner(*)")
      .eq("investor_id", user.id);

    setSubscriptions(data || []);
  };

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get subscribed expert IDs
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("expert_id")
      .eq("investor_id", user.id);

    if (!subs || subs.length === 0) {
      setInsights([]);
      return;
    }

    const expertIds = subs.map(s => s.expert_id);

    // Get insights from subscribed experts
    const { data } = await supabase
      .from("insights")
      .select("*, profiles!insights_expert_id_fkey(*)")
      .in("expert_id", expertIds)
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

      await supabase
        .from("investor_profiles")
        .update({ investment_goal: profileData.investment_goal })
        .eq("user_id", user.id);

      toast.success("Profile updated successfully");
      setEditingProfile(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddComment = async (insightId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const content = newComment[insightId];
      if (!content) {
        toast.error("Please enter a comment");
        return;
      }

      await supabase.from("comments").insert({
        insight_id: insightId,
        user_id: user.id,
        content: content,
      });

      toast.success("Comment added");
      setNewComment({ ...newComment, [insightId]: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-2xl font-bold">Investor Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/investor/browse">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Experts
                </Button>
              </Link>
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
          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Insights Feed</CardTitle>
                <CardDescription>Latest insights from your subscribed experts</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No insights yet</p>
                    <Link to="/investor/browse">
                      <Button>Browse Experts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insights.map((insight) => (
                      <Card key={insight.id} className="border-border">
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={insight.profiles?.image_url} />
                              <AvatarFallback>{insight.profiles?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{insight.profiles?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(insight.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground mb-4">{insight.content}</p>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a comment..."
                                value={newComment[insight.id] || ""}
                                onChange={(e) =>
                                  setNewComment({ ...newComment, [insight.id]: e.target.value })
                                }
                              />
                              <Button onClick={() => handleAddComment(insight.id)}>Comment</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {editingProfile ? (
                  <div className="space-y-4">
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
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Investment Goal</Label>
                      <Textarea
                        value={profileData.investment_goal}
                        onChange={(e) =>
                          setProfileData({ ...profileData, investment_goal: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} size="sm">
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.image_url} />
                        <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile?.name}</p>
                        <p className="text-xs text-muted-foreground">{profile?.bio || "No bio"}</p>
                      </div>
                    </div>
                    {investorProfile?.investment_goal && (
                      <div>
                        <Label className="text-xs">Investment Goal</Label>
                        <p className="text-sm text-muted-foreground">
                          {investorProfile.investment_goal}
                        </p>
                      </div>
                    )}
                    <Button size="sm" onClick={() => setEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscribed Experts */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subscribed Experts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search experts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredSubscriptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subscribed experts yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSubscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={sub.profiles?.image_url} />
                          <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{sub.profiles?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${sub.expert_profiles?.subscription_fee}/{sub.expert_profiles?.subscription_duration}
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
      </div>
    </div>
  );
};

export default InvestorDashboard;
