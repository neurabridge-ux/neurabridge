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

const BrowseExperts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);
  const [subscribedExpertIds, setSubscribedExpertIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
                <Card key={expert.id} className="card-shadow hover:card-shadow-hover transition-smooth">
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
                      onClick={() => handleSubscribe(expert.user_id)}
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
    </div>
  );
};

export default BrowseExperts;
