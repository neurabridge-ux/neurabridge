import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InsightSkeleton } from "@/components/SkeletonLoader";

interface Insight {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  expert_id: string;
  profiles: {
    name: string;
    image_url: string | null;
  };
}

const PublicFeed = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicInsights();
  }, []);

  const loadPublicInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("insights")
        .select(`
          *,
          profiles:expert_id (
            name,
            image_url
          )
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error("Error loading public insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Public Feed</h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <>
              <InsightSkeleton />
              <InsightSkeleton />
              <InsightSkeleton />
            </>
          ) : insights.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No public insights yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => (
              <Card
                key={insight.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/insight/${insight.id}`)}
              >
                {insight.image_url && (
                  <div className="h-64 md:h-80 overflow-hidden">
                    <img
                      src={insight.image_url}
                      alt={insight.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={insight.profiles?.image_url || ""} />
                      <AvatarFallback>
                        {insight.profiles?.name?.charAt(0) || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{insight.profiles?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold">{insight.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {insight.content}
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>{insight.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>Comment</span>
                    </button>
                    <div className="flex items-center gap-2 text-muted-foreground ml-auto">
                      <Eye className="h-5 w-5" />
                      <span>{insight.views_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicFeed;
