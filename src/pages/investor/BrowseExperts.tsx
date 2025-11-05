import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Search, ArrowLeft, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ExpertDetailModal } from "@/components/ExpertDetailModal";

const BrowseExperts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);
  const [subscribedExpertIds, setSubscribedExpertIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [expertTestimonials, setExpertTestimonials] = useState<any[]>([]);
  const [expertInsightsCount, setExpertInsightsCount] = useState<Record<string, number>>({});
  const [subscriberCounts, setSubscriberCounts] = useState<Record<string, number>>({});
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any[]>([]);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      // Load all experts with their profiles
      const { data: expertsData } = await supabase
        .from("profiles")
        .select(`
          *,
          expert_profiles (
            subscription_fee,
            subscription_duration,
            posting_frequency,
            market_categories,
            expectations
          )
        `)
        .eq("user_type", "expert");

      setExperts(expertsData || []);

      // Load insights and subscriber counts for each expert
      if (expertsData) {
        const insightCounts: Record<string, number> = {};
        const subCounts: Record<string, number> = {};
        
        for (const expert of expertsData) {
          const { count: insightCount } = await supabase
            .from("insights")
            .select("*", { count: "exact", head: true })
            .eq("expert_id", expert.user_id);
          
          const { count: subCount } = await supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("expert_id", expert.user_id);
          
          insightCounts[expert.user_id] = insightCount || 0;
          subCounts[expert.user_id] = subCount || 0;
        }
        
        setExpertInsightsCount(insightCounts);
        setSubscriberCounts(subCounts);
      }

      // Load current subscriptions
      const { data: subsData } = await supabase
        .from("subscriptions")
        .select("expert_id")
        .eq("investor_id", user.id);

      setSubscribedExpertIds(new Set(subsData?.map(s => s.expert_id) || []));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (expertId: string) => {
    try {
      if (!currentUserId) return;

      if (subscribedExpertIds.has(expertId)) {
        // Unsubscribe
        await supabase
          .from("subscriptions")
          .delete()
          .eq("investor_id", currentUserId)
          .eq("expert_id", expertId);

        setSubscribedExpertIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(expertId);
          return newSet;
        });

        toast.success("Unsubscribed successfully");
      } else {
        // Subscribe
        await supabase.from("subscriptions").insert({
          investor_id: currentUserId,
          expert_id: expertId,
        });

        // Notify the expert
        const expert = experts.find(e => e.user_id === expertId);
        await supabase.from("notifications").insert({
          user_id: expertId,
          type: "new_subscriber",
          message: `You have a new subscriber!`,
        });

        setSubscribedExpertIds(prev => new Set(prev).add(expertId));
        toast.success(`Subscribed to ${expert?.name}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const viewExpertDetails = async (expert: any) => {
    setSelectedExpert(expert);

    // Load testimonials
    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .eq("expert_id", expert.user_id);

    setExpertTestimonials(testimonialsData || []);

    // Load engagement data for chart
    const { data: insightsData } = await supabase
      .from("insights")
      .select("*")
      .eq("expert_id", expert.user_id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (insightsData) {
      const engagement = insightsData.reverse().map((insight) => ({
        title: insight.title.substring(0, 15) + "...",
        views: insight.views_count || 0,
        likes: insight.likes_count || 0,
        comments: 0, // Would need to count from comments table
      }));
      setEngagementData(engagement);
    }
  };

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="card-shadow mb-8">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="card-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
              <Button variant="ghost" size="icon" onClick={() => navigate("/investor/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Browse Experts</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="card-shadow mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search experts by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Experts Grid */}
        {filteredExperts.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">No experts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => {
              const expertProfile = expert.expert_profiles?.[0];
              const isSubscribed = subscribedExpertIds.has(expert.user_id);

              return (
                <Card 
                  key={expert.id} 
                  className="card-shadow hover:card-shadow-hover transition-smooth cursor-pointer"
                  onClick={() => viewExpertDetails(expert)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={expert.image_url} />
                          <AvatarFallback>{expert.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{expert.name}</CardTitle>
                          {isSubscribed && (
                            <Badge variant="secondary" className="mt-1">
                              Subscribed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <CardDescription className="line-clamp-3">
                      {expert.bio || "No bio available"}
                    </CardDescription>

                    {expert.expert_profiles?.[0]?.expectations && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground font-semibold">What to Expect:</span>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {expert.expert_profiles[0].expectations}
                        </p>
                      </div>
                    )}

                     <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Markets</span>
                        <span className="font-medium text-right">
                          {Array.isArray(expert.expert_profiles?.[0]?.market_categories) && expert.expert_profiles[0].market_categories.length > 0
                            ? expert.expert_profiles[0].market_categories.join(", ")
                            : "General"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insights Posted</span>
                        <span className="font-medium">{expertInsightsCount[expert.user_id] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subscribers</span>
                        <span className="font-medium">{subscriberCounts[expert.user_id] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posting Frequency</span>
                        <span className="font-medium capitalize">{expert.expert_profiles?.[0]?.posting_frequency || "Weekly"}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subscription Fee</span>
                        <span className="font-semibold text-primary">
                          {expertProfile?.subscription_fee === 0 || expertProfile?.subscription_fee === null
                            ? "Free"
                            : `$${expertProfile?.subscription_fee || 0}`}
                        </span>
                      </div>
                      {expertProfile?.subscription_fee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="text-sm capitalize">
                            {expertProfile?.subscription_duration || "monthly"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isSubscribed ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscribe(expert.user_id);
                        }}
                      >
                        {isSubscribed ? "Unsubscribe" : "Subscribe"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await supabase.from("subscription_requests").insert({
                              investor_id: currentUserId,
                              expert_id: expert.user_id,
                            });
                            toast.success("Enrolment request sent to expert");
                          } catch (error: any) {
                            toast.error(error.message);
                          }
                        }}
                      >
                        Request Enrolment
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        navigate(`/marketplace?expert=${expert.user_id}`);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Marketplace
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <ExpertDetailModal
          expert={selectedExpert}
          open={!!selectedExpert}
          onOpenChange={(open) => !open && setSelectedExpert(null)}
          insightsCount={expertInsightsCount[selectedExpert.user_id] || 0}
          subscribersCount={subscriberCounts[selectedExpert.user_id] || 0}
          onSubscribe={handleSubscribe}
          isSubscribed={subscribedExpertIds.has(selectedExpert.user_id)}
        />
      )}

      {/* Testimonial Modal */}
      {selectedTestimonial && (
        <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTestimonial.media_type === "image" ? (
                <img 
                  src={selectedTestimonial.media_url} 
                  alt="Testimonial" 
                  className="w-full rounded-lg"
                />
              ) : selectedTestimonial.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedTestimonial.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BrowseExperts;
