import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { InsightSkeleton } from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";

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

export const PublicInsightsCarousel = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      skipSnaps: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

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
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error("Error loading public insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightClick = (insightId: string) => {
    navigate(`/insight/${insightId}`);
  };

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Public Insights</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightSkeleton />
          <InsightSkeleton />
          <InsightSkeleton />
        </div>
      </section>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Public Insights</h2>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex-[0_0_100%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full"
                onClick={() => handleInsightClick(insight.id)}
              >
                {insight.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={insight.image_url}
                      alt={insight.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold line-clamp-2">
                    {insight.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3">
                    {insight.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={insight.profiles?.image_url || ""} />
                        <AvatarFallback>
                          {insight.profiles?.name?.charAt(0) || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {insight.profiles?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {insight.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {insight.views_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
