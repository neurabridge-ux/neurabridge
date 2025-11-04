import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Eye, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const PublicInsightsPreview = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    loadPublicInsights();
  }, []);

  const loadPublicInsights = async () => {
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
  };

  const handleInsightClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth?redirect=/public-insights");
    } else {
      navigate("/public-insights");
    }
  };

  if (insights.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-primary" />
            <h2 className="text-4xl font-bold">Public Insights</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Explore market insights from verified experts worldwide
          </p>
          <Button 
            variant="ghost" 
            onClick={() => setShowList(!showList)}
            className="mt-4 gap-2"
          >
            {showList ? "Hide Insights" : "View Latest Insights"}
            <ArrowRight className={`h-4 w-4 transition-transform ${showList ? "rotate-90" : ""}`} />
          </Button>
        </div>

        {showList && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={handleInsightClick}
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
                    <Badge style={{ backgroundColor: '#00B488' }} className="gap-1 text-white">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  </div>
                  <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {insight.content}
                  </p>

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
        )}

        {showList && (
          <div className="text-center mt-8">
            <Button onClick={handleInsightClick} size="lg" className="gap-2">
              View All Public Insights
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
