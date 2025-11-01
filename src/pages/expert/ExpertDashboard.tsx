import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  TrendingUp, LogOut, Users, FileText, Settings, DollarSign, BarChart3, 
  LayoutDashboard, X, Edit2, MessageCircle, Send, ShoppingBag, Trash2, Eye 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ImageUpload";
import { NotificationBell } from "@/components/NotificationBell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewType = "dashboard" | "content" | "subscribers" | "settings" | "marketplace";

const MARKET_OPTIONS = [
  "Stocks", "Crypto", "Forex", "Bonds", "Commodities", "ETFs", 
  "Indices", "REITs", "Mutual Funds", "Agro Commodities"
];

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newInsight, setNewInsight] = useState({ title: "", content: "", image_url: "" });
  const [editingInsight, setEditingInsight] = useState<any>(null);
  const [newTestimonial, setNewTestimonial] = useState({ media_url: "", media_type: "image", video_url: "" });
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [profileData, setProfileData] = useState({ name: "", bio: "", image_url: "" });
  const [pricingData, setPricingData] = useState({ subscription_fee: "", subscription_duration: "monthly" });
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<Record<string, string | null>>({});
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [newMarketplaceItem, setNewMarketplaceItem] = useState({
    title: "", description: "", price: "", item_type: "Course", media_url: "", media_type: "image"
  });
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [marketCategories, setMarketCategories] = useState<string[]>([]);
  const [expectations, setExpectations] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

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

      const { data: expertData } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setExpertProfile(expertData);
      setProfileData({
        name: profileData.name,
        bio: profileData.bio || "",
        image_url: profileData.image_url || "",
      });
      setPricingData({
        subscription_fee: expertData?.subscription_fee?.toString() || "0",
        subscription_duration: expertData?.subscription_duration || "monthly",
      });
      setMarketCategories(expertData?.market_categories || []);
      setExpectations(expertData?.expectations || "");

      await loadSubscribers();
      await loadInsights();
      await loadTestimonials();
      await loadMarketplaceItems();
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
      .order("created_at", { ascending: false });

    setSubscribers(data || []);

    if (data && data.length > 0) {
      const sortedData = [...data].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const growthData = sortedData.map((sub, index) => ({
        date: new Date(sub.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        subscribers: index + 1,
      }));
      setSubscriberGrowthData(growthData);
    }
  };

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("insights")
      .select("*, comments(count)")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false });

    setInsights(data || []);

    // Load comments for each insight
    if (data) {
      for (const insight of data) {
        loadComments(insight.id);
      }
    }

    if (data && data.length > 0) {
      const engagement = data.slice(0, 6).reverse().map((insight) => {
        const views = insight.views_count || 0;
        const likes = insight.likes_count || 0;
        const commentCount = insight.comments?.[0]?.count || 0;
        return {
          title: insight.title.substring(0, 15) + "...",
          comments: commentCount,
          likes: likes,
          views: views,
          total: views + likes + commentCount,
        };
      });
      setEngagementData(engagement);
    }
  };

  const loadComments = async (insightId: string) => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey(*)")
      .eq("insight_id", insightId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true });

    if (data) {
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select("*, profiles!comments_user_id_fkey(*)")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );
      setComments((prev) => ({ ...prev, [insightId]: commentsWithReplies }));
    }
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

  const loadMarketplaceItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false });

    setMarketplaceItems(data || []);
  };

  const handlePublishInsight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !newInsight.title || !newInsight.content) {
        toast.error("Please fill in all fields");
        return;
      }

      await supabase.from("insights").insert({
        expert_id: user.id,
        title: newInsight.title,
        content: newInsight.content,
        image_url: newInsight.image_url || null,
      });

      toast.success("Insight published successfully");
      setNewInsight({ title: "", content: "", image_url: "" });
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditInsight = async () => {
    try {
      if (!editingInsight || !editingInsight.title || !editingInsight.content) {
        toast.error("Please fill in all fields");
        return;
      }

      await supabase
        .from("insights")
        .update({
          title: editingInsight.title,
          content: editingInsight.content,
          image_url: editingInsight.image_url || null,
        })
        .eq("id", editingInsight.id);

      toast.success("Insight updated successfully");
      setEditingInsight(null);
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    if (!confirm("Are you sure you want to delete this insight?")) return;
    
    await supabase.from("insights").delete().eq("id", insightId);
    toast.success("Insight deleted");
    loadInsights();
  };

  const handleAddComment = async (insightId: string, parentCommentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const content = parentCommentId
        ? newComment[`${insightId}-${parentCommentId}`]
        : newComment[insightId];

      if (!content) {
        toast.error("Please enter a comment");
        return;
      }

      await supabase.from("comments").insert({
        insight_id: insightId,
        user_id: user.id,
        content: content,
        parent_comment_id: parentCommentId || null,
      });

      toast.success(parentCommentId ? "Reply added" : "Comment added");

      if (parentCommentId) {
        setNewComment({ ...newComment, [`${insightId}-${parentCommentId}`]: "" });
        setReplyTo({ ...replyTo, [insightId]: null });
      } else {
        setNewComment({ ...newComment, [insightId]: "" });
      }

      loadComments(insightId);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddTestimonial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (!newTestimonial.media_url && !newTestimonial.video_url)) {
        toast.error("Please provide an image or video URL");
        return;
      }

      await supabase.from("testimonials").insert({
        expert_id: user.id,
        media_url: newTestimonial.media_url || null,
        video_url: newTestimonial.video_url || null,
        media_type: newTestimonial.video_url ? "video" : "image",
      });

      toast.success("Testimonial added successfully");
      setNewTestimonial({ media_url: "", media_type: "image", video_url: "" });
      loadTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    await supabase.from("testimonials").delete().eq("id", testimonialId);
    toast.success("Testimonial deleted");
    loadTestimonials();
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          name: profileData.name,
          bio: profileData.bio,
          image_url: profileData.image_url,
        })
        .eq("user_id", user.id);

      await supabase
        .from("expert_profiles")
        .update({
          subscription_fee: parseFloat(pricingData.subscription_fee),
          subscription_duration: pricingData.subscription_duration as any,
          market_categories: marketCategories,
          expectations: expectations,
        })
        .eq("user_id", user.id);

      toast.success("Profile updated successfully");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddMarketplaceItem = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !newMarketplaceItem.title || !newMarketplaceItem.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      await supabase.from("marketplace_items").insert({
        expert_id: user.id,
        title: newMarketplaceItem.title,
        description: newMarketplaceItem.description,
        price: parseFloat(newMarketplaceItem.price) || 0,
        item_type: newMarketplaceItem.item_type,
        media_url: newMarketplaceItem.media_url || null,
        media_type: newMarketplaceItem.media_type,
      });

      toast.success("Marketplace item added successfully");
      setNewMarketplaceItem({
        title: "", description: "", price: "", item_type: "Course", media_url: "", media_type: "image"
      });
      loadMarketplaceItems();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteMarketplaceItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    await supabase.from("marketplace_items").delete().eq("id", itemId);
    toast.success("Item deleted");
    loadMarketplaceItems();
  };

  const handleUnsubscribe = async (subscriptionId: string, investorId: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    
    try {
      await supabase.from("subscriptions").delete().eq("id", subscriptionId);
      
      // Notify investor
      const { data: expertData } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", profile?.user_id)
        .single();

      await supabase.from("notifications").insert({
        user_id: investorId,
        type: "Subscription Removed",
        message: `You have been removed from ${expertData?.name || 'an expert'}'s subscription list`,
        action_type: "unsubscribed",
      });
      
      toast.success("Subscriber removed");
      loadSubscribers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const totalRevenue = subscribers.length * (expertProfile?.subscription_fee || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <Skeleton className="h-8 w-full" />
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </nav>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card">
            <div className="px-4 md:px-8 py-4">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="card-shadow">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-shadow">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card className="card-shadow">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <img src="/neurabridge-logo.png" alt="NeuraBridge" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-bold">NeuraBridge</h1>
              <p className="text-xs text-muted-foreground">Expert Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={currentView === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentView === "content" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("content")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Content
          </Button>
          <Button
            variant={currentView === "subscribers" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("subscribers")}
          >
            <Users className="h-4 w-4 mr-2" />
            Subscribers
          </Button>
          <Button
            variant={currentView === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant={currentView === "marketplace" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("marketplace")}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Marketplace
          </Button>
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="px-4 md:px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {currentView === "dashboard" && "Dashboard Overview"}
                {currentView === "content" && "Content & Insights"}
                {currentView === "subscribers" && "Subscribers"}
                {currentView === "settings" && "Settings"}
                {currentView === "marketplace" && "Marketplace"}
              </h2>
              <p className="text-sm text-muted-foreground">Welcome back, {profile?.name}</p>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription>Total Subscribers</CardDescription>
                    <CardTitle className="text-2xl md:text-3xl">{subscribers.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription>Total Insights</CardDescription>
                    <CardTitle className="text-2xl md:text-3xl">{insights.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription>Monthly Revenue</CardDescription>
                    <CardTitle className="text-2xl md:text-3xl">${totalRevenue}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardDescription>Subscription Fee</CardDescription>
                    <CardTitle className="text-2xl md:text-3xl">
                      {expertProfile?.subscription_fee === 0
                        ? "Free"
                        : `$${expertProfile?.subscription_fee || 0}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscriber Growth Chart */}
                <Card className="card-shadow lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Subscriber Growth</CardTitle>
                    <CardDescription>Cumulative subscriber growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriberGrowthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={subscriberGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "6px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="subscribers"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">
                        No subscriber data yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Subscribers */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>Recent Subscribers</CardTitle>
                    <CardDescription>Latest subscribers to your insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscribers.length > 0 ? (
                      <div className="space-y-4">
                        {subscribers.slice(0, 5).map((sub) => (
                          <div key={sub.id} className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={sub.profiles?.image_url} className="object-cover" />
                              <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{sub.profiles?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sub.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        No subscribers yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Chart */}
              {engagementData.length > 0 && (
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>Investor Engagement</CardTitle>
                    <CardDescription>Engagement metrics for your recent insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="title"
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          name="Total Engagement"
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Views"
                        />
                        <Line
                          type="monotone"
                          dataKey="likes"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Likes"
                        />
                        <Line
                          type="monotone"
                          dataKey="comments"
                          stroke="#6b7280"
                          strokeWidth={2}
                          name="Comments"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Content View */}
          {currentView === "content" && (
            <div className="space-y-6">
              {/* Publish New Insight */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Publish New Insight</CardTitle>
                  <CardDescription>Share your expertise with subscribers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newInsight.title}
                        onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
                        placeholder="Insight title..."
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={newInsight.content}
                        onChange={(e) =>
                          setNewInsight({ ...newInsight, content: e.target.value })
                        }
                        placeholder="Share your insights..."
                        rows={4}
                      />
                    </div>
                    <ImageUpload
                      bucket="insight-images"
                      currentImageUrl={newInsight.image_url}
                      onUploadComplete={(url) => setNewInsight({ ...newInsight, image_url: url })}
                      label="Optional Image"
                    />
                    <Button onClick={handlePublishInsight}>Publish Insight</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Your Recent Insights */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Your Recent Insights</CardTitle>
                  <CardDescription>Manage your published content</CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No insights yet</p>
                  ) : (
                    <div className="space-y-4">
                      {insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="p-4 border border-border rounded-lg bg-muted/20"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                {insight.content}
                              </p>
                              {insight.image_url && (
                                <img
                                  src={insight.image_url}
                                  alt="Insight"
                                  className="mt-3 h-48 w-full object-cover rounded-lg"
                                />
                              )}
                              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                <span>
                                  <MessageCircle className="h-3 w-3 inline mr-1" />
                                  {insight.comments?.[0]?.count || 0} comments
                                </span>
                                <span>👁️ {insight.views_count || 0} views</span>
                                <span>❤️ {insight.likes_count || 0} likes</span>
                                <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingInsight(insight)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteInsight(insight.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Comments Section */}
                          {comments[insight.id]?.length > 0 && (
                            <div className="mt-4 space-y-3 p-3 bg-muted/30 rounded-lg">
                              <h4 className="text-sm font-semibold">Comments</h4>
                              {comments[insight.id].map((comment: any) => (
                                <div key={comment.id} className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={comment.profiles?.image_url}
                                        className="object-cover"
                                      />
                                      <AvatarFallback>
                                        {comment.profiles?.name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-card p-3 rounded-lg">
                                        <p className="text-sm font-medium">
                                          {comment.profiles?.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {comment.content}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs mt-1"
                                        onClick={() =>
                                          setReplyTo({ ...replyTo, [insight.id]: comment.id })
                                        }
                                      >
                                        Reply
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Replies */}
                                  {comment.replies?.length > 0 && (
                                    <div className="ml-10 space-y-2">
                                      {comment.replies.map((reply: any) => (
                                        <div
                                          key={reply.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage
                                              src={reply.profiles?.image_url}
                                              className="object-cover"
                                            />
                                            <AvatarFallback>
                                              {reply.profiles?.name?.[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 bg-card p-2 rounded-lg">
                                            <p className="text-xs font-medium">
                                              {reply.profiles?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {reply.content}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reply Input */}
                                  {replyTo[insight.id] === comment.id && (
                                    <div className="ml-10 flex gap-2 mt-2">
                                      <Input
                                        placeholder="Write a reply..."
                                        value={
                                          newComment[`${insight.id}-${comment.id}`] || ""
                                        }
                                        onChange={(e) =>
                                          setNewComment({
                                            ...newComment,
                                            [`${insight.id}-${comment.id}`]: e.target.value,
                                          })
                                        }
                                        className="text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddComment(insight.id, comment.id)}
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          <div className="flex gap-2 mt-4">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment[insight.id] || ""}
                              onChange={(e) =>
                                setNewComment({ ...newComment, [insight.id]: e.target.value })
                              }
                            />
                            <Button onClick={() => handleAddComment(insight.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscribers View */}
          {currentView === "subscribers" && (
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Subscribers</CardTitle>
                <CardDescription>
                  {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscribers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No subscribers yet</p>
                ) : (
                  <div className="space-y-4">
                    {subscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-muted/20"
                      >
                        <Avatar 
                          className="h-12 w-12 cursor-pointer" 
                          onClick={() => setSelectedInvestor(sub)}
                        >
                          <AvatarImage src={sub.profiles?.image_url} className="object-cover" />
                          <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{sub.profiles?.name}</p>
                          <p className="text-sm text-muted-foreground">{sub.profiles?.bio}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Subscribed {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsubscribe(sub.id, sub.investor_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings View */}
          {currentView === "settings" && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your public profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ImageUpload
                      bucket="profile-images"
                      currentImageUrl={profileData.image_url}
                      onUploadComplete={(url) =>
                        setProfileData({ ...profileData, image_url: url })
                      }
                      isProfile
                      label="Profile Picture"
                    />
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({ ...profileData, bio: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Subscription Fee ($)</Label>
                      <Input
                        type="number"
                        value={pricingData.subscription_fee}
                        onChange={(e) =>
                          setPricingData({ ...pricingData, subscription_fee: e.target.value })
                        }
                        placeholder="0 for free subscription"
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter 0 for free subscription
                      </p>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={pricingData.subscription_duration}
                        onChange={(e) =>
                          setPricingData({
                            ...pricingData,
                            subscription_duration: e.target.value,
                          })
                        }
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>

                    <Separator />

                    <div>
                      <Label>Market Categories</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select markets you operate in
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MARKET_OPTIONS.map((market) => (
                          <label
                            key={market}
                            className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-smooth"
                          >
                            <input
                              type="checkbox"
                              checked={marketCategories.includes(market)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMarketCategories([...marketCategories, market]);
                                } else {
                                  setMarketCategories(marketCategories.filter(m => m !== market));
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{market}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>What Investors Can Expect</Label>
                      <Textarea
                        value={expectations}
                        onChange={(e) => {
                          if (e.target.value.length <= 300) {
                            setExpectations(e.target.value);
                          }
                        }}
                        rows={3}
                        maxLength={300}
                        placeholder="Describe what investors can expect from your insights..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {expectations.length}/300 characters
                      </p>
                    </div>

                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>Add images or video links for your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ImageUpload
                      bucket="testimonial-images"
                      currentImageUrl={newTestimonial.media_url}
                      onUploadComplete={(url) =>
                        setNewTestimonial({ ...newTestimonial, media_url: url })
                      }
                      label="Upload Testimonial Image"
                    />
                    <div>
                      <Label>Or Video URL (YouTube/Vimeo)</Label>
                      <Input
                        placeholder="https://youtube.com/..."
                        value={newTestimonial.video_url}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, video_url: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handleAddTestimonial}>Add Testimonial</Button>

                    {testimonials.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-semibold">Your Testimonials</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {testimonials.map((testimonial) => (
                            <div
                              key={testimonial.id}
                              className="relative group cursor-pointer"
                              onClick={() => setSelectedTestimonial(testimonial)}
                            >
                           {testimonial.video_url ? (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                                  <Eye className="h-8 w-8 text-primary" />
                                  <p className="absolute bottom-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                    Video
                                  </p>
                                </div>
                              ) : (
                                <img
                                  src={testimonial.media_url}
                                  alt="Testimonial"
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              )}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTestimonial(testimonial.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marketplace View */}
          {currentView === "marketplace" && (
            <div className="space-y-6">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Add Marketplace Item</CardTitle>
                  <CardDescription>Share courses, trainings, services, or opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newMarketplaceItem.title}
                        onChange={(e) =>
                          setNewMarketplaceItem({ ...newMarketplaceItem, title: e.target.value })
                        }
                        placeholder="e.g., Advanced Trading Course"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newMarketplaceItem.description}
                        onChange={(e) =>
                          setNewMarketplaceItem({ ...newMarketplaceItem, description: e.target.value })
                        }
                        rows={3}
                        placeholder="Describe your offering..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={newMarketplaceItem.price}
                          onChange={(e) =>
                            setNewMarketplaceItem({ ...newMarketplaceItem, price: e.target.value })
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newMarketplaceItem.item_type}
                          onChange={(e) =>
                            setNewMarketplaceItem({ ...newMarketplaceItem, item_type: e.target.value })
                          }
                        >
                          <option value="Course">Course</option>
                          <option value="Training">Training</option>
                          <option value="Service">Service</option>
                          <option value="Opportunity">Opportunity</option>
                        </select>
                      </div>
                    </div>
                    <ImageUpload
                      bucket="insight-images"
                      currentImageUrl={newMarketplaceItem.media_url}
                      onUploadComplete={(url) =>
                        setNewMarketplaceItem({ ...newMarketplaceItem, media_url: url, media_type: "image" })
                      }
                      label="Upload Image or Video"
                    />
                    <Button onClick={handleAddMarketplaceItem}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {marketplaceItems.length > 0 && (
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>Your Marketplace Items</CardTitle>
                    <CardDescription>{marketplaceItems.length} items listed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {marketplaceItems.map((item) => (
                          <Card key={item.id} className="border">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{item.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">{item.item_type}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteMarketplaceItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {item.media_url && (
                                <img
                                  src={item.media_url}
                                  alt={item.title}
                                  className="w-full h-32 object-cover rounded-md mb-3"
                                />
                              )}
                              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                              <p className="text-lg font-bold text-primary">${item.price}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Edit Insight Dialog */}
      {editingInsight && (
        <Dialog open={!!editingInsight} onOpenChange={() => setEditingInsight(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Insight</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingInsight.title}
                  onChange={(e) =>
                    setEditingInsight({ ...editingInsight, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={editingInsight.content}
                  onChange={(e) =>
                    setEditingInsight({ ...editingInsight, content: e.target.value })
                  }
                  rows={6}
                />
              </div>
              <ImageUpload
                bucket="insight-images"
                currentImageUrl={editingInsight.image_url}
                onUploadComplete={(url) =>
                  setEditingInsight({ ...editingInsight, image_url: url })
                }
                label="Optional Image"
              />
              <div className="flex gap-2">
                <Button onClick={handleEditInsight}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingInsight(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Testimonial View Dialog */}
      {selectedTestimonial && (
        <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTestimonial.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedTestimonial.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={selectedTestimonial.media_url}
                  alt="Testimonial"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Investor Detail Dialog */}
      {selectedInvestor && (
        <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Investor Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedInvestor.profiles?.image_url} className="object-cover" />
                  <AvatarFallback className="text-2xl">
                    {selectedInvestor.profiles?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{selectedInvestor.profiles?.name}</h3>
                  <p className="text-muted-foreground">{selectedInvestor.profiles?.bio}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Subscribed Date</Label>
                  <p className="font-medium">{new Date(selectedInvestor.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="font-medium text-green-600">Active Subscriber</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleUnsubscribe(selectedInvestor.id, selectedInvestor.investor_id);
                    setSelectedInvestor(null);
                  }}
                >
                  Remove Subscriber
                </Button>
                <Button variant="outline" onClick={() => setSelectedInvestor(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExpertDashboard;
