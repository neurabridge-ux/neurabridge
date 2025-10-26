import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, LogOut, Users, FileText, Settings, DollarSign, BarChart3, LayoutDashboard, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ImageUpload";
import { NotificationBell } from "@/components/NotificationBell";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ViewType = "dashboard" | "content" | "subscribers" | "settings";

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
  const [newTestimonial, setNewTestimonial] = useState({ media_url: "", media_type: "image", video_url: "" });
  const [profileData, setProfileData] = useState({ name: "", bio: "", image_url: "" });
  const [pricingData, setPricingData] = useState({ subscription_fee: "", subscription_duration: "monthly" });
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);

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

      const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (profileData?.user_type !== "expert") {
        navigate("/investor/dashboard");
        return;
      }

      setProfile(profileData);
      const { data: expertData } = await supabase.from("expert_profiles").select("*").eq("user_id", user.id).single();
      setExpertProfile(expertData);
      setProfileData({ name: profileData.name, bio: profileData.bio || "", image_url: profileData.image_url || "" });
      setPricingData({ subscription_fee: expertData?.subscription_fee?.toString() || "0", subscription_duration: expertData?.subscription_duration || "monthly" });

      await loadSubscribers();
      await loadInsights();
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
    const { data } = await supabase.from("subscriptions").select("*, profiles!subscriptions_investor_id_fkey(*)").eq("expert_id", user.id).order("created_at", { ascending: false });
    setSubscribers(data || []);
    if (data && data.length > 0) {
      const sortedData = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const growthData = sortedData.map((sub, index) => ({ date: new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), subscribers: index + 1 }));
      setSubscriberGrowthData(growthData);
    }
  };

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("insights").select("*, comments(count)").eq("expert_id", user.id).order("created_at", { ascending: false });
    setInsights(data || []);
    if (data && data.length > 0) {
      const engagement = data.slice(0, 6).reverse().map((insight) => ({ title: insight.title.substring(0, 15) + "...", comments: insight.comments?.[0]?.count || 0 }));
      setEngagementData(engagement);
    }
  };

  const loadTestimonials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("testimonials").select("*").eq("expert_id", user.id).order("created_at", { ascending: false });
    setTestimonials(data || []);
  };

  const handlePublishInsight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !newInsight.title || !newInsight.content) {
        toast.error("Please fill in all fields");
        return;
      }
      await supabase.from("insights").insert({ expert_id: user.id, title: newInsight.title, content: newInsight.content, image_url: newInsight.image_url || null });
      toast.success("Insight published successfully");
      setNewInsight({ title: "", content: "", image_url: "" });
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    await supabase.from("insights").delete().eq("id", insightId);
    toast.success("Insight deleted");
    loadInsights();
  };

  const handleAddTestimonial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (!newTestimonial.media_url && !newTestimonial.video_url)) {
        toast.error("Please provide an image or video URL");
        return;
      }
      await supabase.from("testimonials").insert({ expert_id: user.id, media_url: newTestimonial.media_url || null, video_url: newTestimonial.video_url || null, media_type: newTestimonial.video_url ? "video" : "image" });
      toast.success("Testimonial added successfully");
      setNewTestimonial({ media_url: "", media_type: "image", video_url: "" });
      loadTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    await supabase.from("testimonials").delete().eq("id", testimonialId);
    toast.success("Testimonial deleted");
    loadTestimonials();
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ name: profileData.name, bio: profileData.bio, image_url: profileData.image_url }).eq("user_id", user.id);
      await supabase.from("expert_profiles").update({ subscription_fee: parseFloat(pricingData.subscription_fee), subscription_duration: pricingData.subscription_duration as any }).eq("user_id", user.id);
      toast.success("Profile updated successfully");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const totalRevenue = subscribers.length * (expertProfile?.subscription_fee || 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border"><div className="flex items-center space-x-3"><TrendingUp className="h-8 w-8 text-primary" /><div><h1 className="text-xl font-bold">NeuraBridge</h1><p className="text-xs text-muted-foreground">Expert Portal</p></div></div></div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant={currentView === "dashboard" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setCurrentView("dashboard")}><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Button>
          <Button variant={currentView === "content" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setCurrentView("content")}><FileText className="h-4 w-4 mr-2" />Content</Button>
          <Button variant={currentView === "subscribers" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setCurrentView("subscribers")}><Users className="h-4 w-4 mr-2" />Subscribers</Button>
          <Button variant={currentView === "settings" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setCurrentView("settings")}><Settings className="h-4 w-4 mr-2" />Settings</Button>
        </nav>
        <div className="p-4 border-t border-border"><Button variant="ghost" className="w-full justify-start" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button></div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card"><div className="px-8 py-4 flex justify-between items-center"><div><h2 className="text-2xl font-bold">{currentView === "dashboard" && "Dashboard Overview"}{currentView === "content" && "Content & Insights"}{currentView === "subscribers" && "Subscribers"}{currentView === "settings" && "Settings"}</h2><p className="text-sm text-muted-foreground">Welcome back, {profile?.name}</p></div><NotificationBell /></div></header>

        <main className="flex-1 overflow-y-auto p-8">
          {currentView === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-shadow"><CardHeader className="pb-3"><CardDescription>Total Subscribers</CardDescription><CardTitle className="text-3xl">{subscribers.length}</CardTitle></CardHeader><CardContent><Users className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
                <Card className="card-shadow"><CardHeader className="pb-3"><CardDescription>Total Insights</CardDescription><CardTitle className="text-3xl">{insights.length}</CardTitle></CardHeader><CardContent><FileText className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
                <Card className="card-shadow"><CardHeader className="pb-3"><CardDescription>Monthly Revenue</CardDescription><CardTitle className="text-3xl">${totalRevenue}</CardTitle></CardHeader><CardContent><DollarSign className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
                <Card className="card-shadow"><CardHeader className="pb-3"><CardDescription>Subscription Fee</CardDescription><CardTitle className="text-3xl">${expertProfile?.subscription_fee || 0}</CardTitle></CardHeader><CardContent><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="card-shadow lg:col-span-2"><CardHeader><CardTitle>Subscriber Growth</CardTitle><CardDescription>Cumulative subscriber growth over time</CardDescription></CardHeader><CardContent>{subscriberGrowthData.length > 0 ? <ResponsiveContainer width="100%" height={300}><AreaChart data={subscriberGrowthData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} /><YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} /><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} /><Area type="monotone" dataKey="subscribers" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} /></AreaChart></ResponsiveContainer> : <p className="text-center text-muted-foreground py-12">No subscriber data yet</p>}</CardContent></Card>
                <Card className="card-shadow"><CardHeader><CardTitle>Recent Subscribers</CardTitle><CardDescription>Latest subscribers to your insights</CardDescription></CardHeader><CardContent>{subscribers.length > 0 ? <div className="space-y-4">{subscribers.slice(0, 5).map((sub) => <div key={sub.id} className="flex items-center space-x-3"><Avatar className="h-10 w-10"><AvatarImage src={sub.profiles?.image_url} /><AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{sub.profiles?.name}</p><p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p></div></div>)}</div> : <p className="text-center text-muted-foreground py-8 text-sm">No subscribers yet</p>}</CardContent></Card>
              </div>

              {engagementData.length > 0 && <Card className="card-shadow"><CardHeader><CardTitle>Investor Engagement</CardTitle><CardDescription>Comments on your recent insights</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={engagementData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="title" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} /><YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} /><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} /><Line type="monotone" dataKey="comments" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>}
            </div>
          )}

          {currentView === "content" && <div className="space-y-6"><Card className="card-shadow"><CardHeader><CardTitle>Publish New Insight</CardTitle><CardDescription>Share your expertise with subscribers</CardDescription></CardHeader><CardContent><div className="space-y-4"><div><Label>Title</Label><Input value={newInsight.title} onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })} placeholder="Insight title..." /></div><div><Label>Content</Label><Textarea value={newInsight.content} onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })} placeholder="Share your insights..." rows={4} /></div><ImageUpload bucket="insight-images" currentImageUrl={newInsight.image_url} onUploadComplete={(url) => setNewInsight({ ...newInsight, image_url: url })} label="Optional Image" /><Button onClick={handlePublishInsight}>Publish Insight</Button></div></CardContent></Card><Card className="card-shadow"><CardHeader><CardTitle>Your Recent Insights</CardTitle><CardDescription>Manage your published content</CardDescription></CardHeader><CardContent>{insights.length === 0 ? <p className="text-muted-foreground text-center py-8">No insights yet</p> : <div className="space-y-4">{insights.map((insight) => <div key={insight.id} className="p-4 border border-border rounded-lg bg-muted/20"><div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-semibold">{insight.title}</h3><p className="text-sm text-muted-foreground mt-1">{insight.content}</p>{insight.image_url && <img src={insight.image_url} alt="Insight" className="mt-3 h-32 w-full object-cover rounded-lg" />}<div className="flex gap-4 mt-3 text-xs text-muted-foreground"><span>{insight.comments?.[0]?.count || 0} comments</span><span>{new Date(insight.created_at).toLocaleDateString()}</span></div></div><Button variant="ghost" size="icon" onClick={() => handleDeleteInsight(insight.id)}><X className="h-4 w-4" /></Button></div></div>)}</div>}</CardContent></Card></div>}

          {currentView === "subscribers" && <Card className="card-shadow"><CardHeader><CardTitle>Your Subscribers</CardTitle><CardDescription>{subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}</CardDescription></CardHeader><CardContent>{subscribers.length === 0 ? <p className="text-muted-foreground text-center py-8">No subscribers yet</p> : <div className="space-y-4">{subscribers.map((sub) => <div key={sub.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-muted/20"><Avatar className="h-12 w-12"><AvatarImage src={sub.profiles?.image_url} /><AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback></Avatar><div className="flex-1"><p className="font-medium">{sub.profiles?.name}</p><p className="text-sm text-muted-foreground">{sub.profiles?.bio}</p><p className="text-xs text-muted-foreground mt-1">Subscribed {new Date(sub.created_at).toLocaleDateString()}</p></div></div>)}</div>}</CardContent></Card>}

          {currentView === "settings" && <div className="space-y-6"><Card className="card-shadow"><CardHeader><CardTitle>Profile Settings</CardTitle><CardDescription>Manage your public profile</CardDescription></CardHeader><CardContent><div className="space-y-4"><ImageUpload bucket="profile-images" currentImageUrl={profileData.image_url} onUploadComplete={(url) => setProfileData({ ...profileData, image_url: url })} isProfile label="Profile Picture" /><div><Label>Name</Label><Input value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} /></div><div><Label>Bio</Label><Textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} rows={3} /></div><Separator /><div><Label>Subscription Fee ($)</Label><Input type="number" value={pricingData.subscription_fee} onChange={(e) => setPricingData({ ...pricingData, subscription_fee: e.target.value })} /></div><div><Label>Duration</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={pricingData.subscription_duration} onChange={(e) => setPricingData({ ...pricingData, subscription_duration: e.target.value })}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div><Button onClick={handleUpdateProfile}>Save Changes</Button></div></CardContent></Card><Card className="card-shadow"><CardHeader><CardTitle>Testimonials</CardTitle><CardDescription>Add images or video links for your profile</CardDescription></CardHeader><CardContent><div className="space-y-4"><ImageUpload bucket="testimonial-images" currentImageUrl={newTestimonial.media_url} onUploadComplete={(url) => setNewTestimonial({ ...newTestimonial, media_url: url })} label="Upload Testimonial Image" /><div><Label>Or Video URL (YouTube/Vimeo)</Label><Input placeholder="https://youtube.com/..." value={newTestimonial.video_url} onChange={(e) => setNewTestimonial({ ...newTestimonial, video_url: e.target.value })} /></div><Button onClick={handleAddTestimonial}>Add Testimonial</Button>{testimonials.length > 0 && <div className="mt-6 space-y-4"><h4 className="font-semibold">Your Testimonials</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{testimonials.map((testimonial) => <div key={testimonial.id} className="relative group">{testimonial.video_url ? <div className="aspect-video bg-muted rounded-lg flex items-center justify-center"><p className="text-xs text-muted-foreground">Video Link</p></div> : <img src={testimonial.media_url} alt="Testimonial" className="w-full h-32 object-cover rounded-lg" />}<Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteTestimonial(testimonial.id)}><X className="h-3 w-3" /></Button></div>)}</div></div>}</div></CardContent></Card></div>}
        </main>
      </div>
    </div>
  );
};

export default ExpertDashboard;
