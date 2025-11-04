import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InsightModal } from "./InsightModal";

export const PublicInsightsCarousel = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  useEffect(() => {
    loadPublicInsights();
  }, []);

  const loadPublicInsights = async () => {
    try {
      const { data } = await supabase
        .from("insights")
        .select(`
          *,
          profiles:expert_id (
            name,
            image_url
          )
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(6);

      setInsights(data || []);
    } catch (error: any) {
      console.error("Failed to load public insights", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || insights.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Public Insights</h2>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/public-insights")}
          className="text-primary hover:text-primary/80"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors line-clamp-2">
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="line-clamp-2 text-sm">
                {insight.content}
              </CardDescription>

              {insight.image_url && (
                <img
                  src={insight.image_url}
                  alt={insight.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}

              <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                <div className="flex items-center space-x-3">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InsightModal
        insight={selectedInsight}
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
      />
    </div>
  );
};
