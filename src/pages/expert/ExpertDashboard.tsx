import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Bell, Users, FileText, Settings, LogOut, BarChart3, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newInsight, setNewInsight] = useState({ title: "", content: "", image_url: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "" });
  const [pricingData, setPricingData] = useState<{ fee: number; duration: "free" | "monthly" | "quarterly" | "yearly" }>({ fee: 0, duration: "monthly" });
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({ media_url: "", media_type: "image" });

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
      await loadTestimonials();
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
      .eq("expert_id", user.id)
      .order("created_at", { ascending: true });

    setSubscribers(data || []);
    
    // Process data for growth chart
    if (data && data.length > 0) {
      const growthMap = new Map<string, number>();
      let cumulativeCount = 0;
      
      data.forEach((sub) => {
        const date = new Date(sub.created_at);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        cumulativeCount++;
        growthMap.set(monthYear, cumulativeCount);
      });
      
      const chartData = Array.from(growthMap.entries()).map(([month, count]) => ({
        month,
        subscribers: count,
      }));
      
      setSubscriberGrowthData(chartData);
    } else {
      setSubscriberGrowthData([]);
    }
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

  const loadTestimonials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false });

    setTestimonials(data || []);
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
      setNewInsight({ title: "", content: "", image_url: "" });
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAddTestimonial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!newTestimonial.media_url) {
        toast.error("Please enter a media URL");
        return;
      }

      await supabase.from("testimonials").insert({
        expert_id: user.id,
        media_url: newTestimonial.media_url,
        media_type: newTestimonial.media_type,
      });

      toast.success("Testimonial added successfully");
      setNewTestimonial({ media_url: "", media_type: "image" });
      loadTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-shadow hover:card-shadow-hover transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscribers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active subscribers
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Published content
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(subscribers.length * (expertProfile?.subscription_fee || 0)).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on subscribers
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Fee</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${expertProfile?.subscription_fee || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                Per {expertProfile?.subscription_duration || "month"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriber Growth Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Subscriber Growth
                </CardTitle>
                <CardDescription>Track your subscriber growth over time</CardDescription>
              </div>
              <Badge variant="secondary">{subscribers.length} Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {subscriberGrowthData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No subscriber data yet. Start growing your audience!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={subscriberGrowthData}>
                  <defs>
                    <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="subscribers" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSubscribers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="insights">Content</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Publish New Insight */}
            <Card className="card-shadow">
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
                    rows={8}
                    placeholder="Share your investment insights..."
                  />
                </div>
                <div>
                  <Label>Image URL (Optional)</Label>
                  <Input
                    value={newInsight.image_url}
                    onChange={(e) => setNewInsight({ ...newInsight, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button onClick={handlePublishInsight} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Publish Insight
                </Button>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Recent Insights</CardTitle>
                <CardDescription>Your published content</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No insights published yet</p>
                    <p className="text-sm text-muted-foreground">Start sharing your expertise with subscribers</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div key={insight.id} className="border border-border rounded-lg p-4 hover:border-primary transition-smooth">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{insight.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(insight.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Subscribers</CardTitle>
                <CardDescription>People who follow your insights</CardDescription>
              </CardHeader>
              <CardContent>
                {subscribers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No subscribers yet</p>
                    <p className="text-sm text-muted-foreground">Share your profile to start building your audience</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-smooth">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={sub.profiles?.image_url} />
                            <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{sub.profiles?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Subscribed on {new Date(sub.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Settings */}
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
                          placeholder="Tell investors about your expertise..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4 mb-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profile?.image_url} />
                          <AvatarFallback className="text-2xl">{profile?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{profile?.name}</p>
                          <p className="text-sm text-muted-foreground">{profile?.bio || "No bio yet"}</p>
                        </div>
                      </div>
                      <Button onClick={() => setEditingProfile(true)} className="w-full">
                        Edit Profile
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Settings */}
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
                      onChange={(e) => setPricingData({ ...pricingData, fee: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Billing Period</Label>
                    <Select
                      value={pricingData.duration}
                      onValueChange={(value) => setPricingData({ ...pricingData, duration: value as "free" | "monthly" | "quarterly" | "yearly" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Estimated Monthly Revenue</span>
                      <span className="font-semibold text-lg">
                        ${(subscribers.length * (pricingData.fee || 0)).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Based on {subscribers.length} active subscribers</p>
                  </div>
                  <Button onClick={handleUpdatePricing} className="w-full">
                    Update Pricing
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Testimonials Section */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Add images or video links to showcase your expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Media URL</Label>
                    <Input
                      value={newTestimonial.media_url}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, media_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>Media Type</Label>
                    <Select
                      value={newTestimonial.media_type}
                      onValueChange={(value) => setNewTestimonial({ ...newTestimonial, media_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddTestimonial} className="w-full">
                  Add Testimonial
                </Button>

                {testimonials.length > 0 && (
                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-2">
                        {testimonial.media_type === "image" ? (
                          <img 
                            src={testimonial.media_url} 
                            alt="Testimonial" 
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted flex items-center justify-center rounded">
                            <p className="text-xs">Video: {testimonial.media_url}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Subscribers Section */}
        {subscribers.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Recent Subscribers</CardTitle>
              <CardDescription>Your newest followers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscribers.slice(0, 6).reverse().map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary transition-smooth cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sub.profiles?.image_url} />
                      <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{sub.profiles?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExpertDashboard;
