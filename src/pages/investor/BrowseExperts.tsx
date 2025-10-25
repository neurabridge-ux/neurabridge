import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Search, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const BrowseExperts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);
  const [subscribedExpertIds, setSubscribedExpertIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [expertTestimonials, setExpertTestimonials] = useState<any[]>([]);

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
        .select("*, expert_profiles!inner(*)")
        .eq("user_type", "expert");

      setExperts(expertsData || []);

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
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("expert_id", expert.user_id);

    setExpertTestimonials(data || []);
  };

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.bio?.toLowerCase().includes(searchTerm.toLowerCase())
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

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subscription Fee</span>
                        <span className="font-semibold text-primary">
                          {expertProfile?.subscription_fee === 0
                            ? "Free"
                            : `$${expertProfile?.subscription_fee}`}
                        </span>
                      </div>
                      {expertProfile?.subscription_fee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="text-sm capitalize">
                            {expertProfile?.subscription_duration}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      variant={isSubscribed ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(expert.user_id);
                      }}
                    >
                      {isSubscribed ? "Unsubscribe" : "Subscribe"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Expert Detail Dialog */}
      {selectedExpert && (
        <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Expert Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedExpert.image_url} />
                  <AvatarFallback className="text-3xl">
                    {selectedExpert.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedExpert.name}</h3>
                  <p className="text-muted-foreground mt-2">{selectedExpert.bio || "No bio available"}</p>
                  <div className="flex gap-3 mt-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Subscription Fee: </span>
                      <span className="text-lg font-semibold text-primary">
                        {selectedExpert.expert_profiles?.[0]?.subscription_fee === 0
                          ? "Free"
                          : `$${selectedExpert.expert_profiles?.[0]?.subscription_fee}`}
                      </span>
                    </div>
                    {selectedExpert.expert_profiles?.[0]?.subscription_fee > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">/ </span>
                        <span className="text-sm capitalize">
                          {selectedExpert.expert_profiles?.[0]?.subscription_duration}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="mt-4"
                    variant={subscribedExpertIds.has(selectedExpert.user_id) ? "outline" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribe(selectedExpert.user_id);
                    }}
                  >
                    {subscribedExpertIds.has(selectedExpert.user_id) ? "Unsubscribe" : "Subscribe"}
                  </Button>
                </div>
              </div>

              {expertTestimonials.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-4">Testimonials</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {expertTestimonials.map((testimonial) => (
                        <div key={testimonial.id} className="border rounded-lg overflow-hidden">
                          {testimonial.media_type === "image" ? (
                            <img 
                              src={testimonial.media_url} 
                              alt="Testimonial" 
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-muted flex items-center justify-center p-4">
                              <p className="text-xs text-center truncate">{testimonial.media_url}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BrowseExperts;
