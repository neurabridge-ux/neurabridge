import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, ArrowLeft, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { InsightModal } from "@/components/InsightModal";

const PublicInsights = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to continue exploring insights");
      navigate("/auth?redirect=/public-insights");
      return;
    }
    setCurrentUserId(user.id);
    loadPublicInsights();
  };

  const loadPublicInsights = async () => {
    try {

      const { data: insightsData } = await supabase
        .from("insights")
        .select(`
          *,
          profiles:expert_id (
            name,
            image_url,
            bio
          )
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      setInsights(insightsData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (insightId: string) => {
    if (!currentUserId) {
      toast.error("Please login to like insights");
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("insight_likes")
        .insert({ insight_id: insightId, user_id: currentUserId });

      if (error) throw error;
      toast.success("Liked!");
      loadPublicInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
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
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(currentUserId ? "/investor/dashboard" : "/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Public Insights</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore Expert Insights</h2>
          <p className="text-muted-foreground">
            Discover public market insights from verified experts worldwide
          </p>
        </div>

        {insights.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No public insights available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedInsight(insight)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={insight.profiles?.image_url} />
                        <AvatarFallback>{insight.profiles?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{insight.profiles?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                     <Badge className="gap-1 bg-[#00B488] text-white hover:bg-[#00966E]">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {insight.content}
                  </CardDescription>

                  {insight.image_url && (
                    <img
                      src={insight.image_url}
                      alt={insight.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{insight.views_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{insight.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>0</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(insight.id);
                      }}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <InsightModal
          insight={selectedInsight}
          open={!!selectedInsight}
          onOpenChange={(open) => !open && setSelectedInsight(null)}
        />
      )}
    </div>
  );
};

export default PublicInsights;
