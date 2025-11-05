import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ExpertDetailModalProps {
  expert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insightsCount: number;
  subscribersCount: number;
  onSubscribe: (expertId: string) => void;
  isSubscribed: boolean;
}

export const ExpertDetailModal = ({ 
  expert, 
  open, 
  onOpenChange, 
  insightsCount, 
  subscribersCount,
  onSubscribe,
  isSubscribed 
}: ExpertDetailModalProps) => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [publicInsights, setPublicInsights] = useState<any[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);

  useEffect(() => {
    if (expert && open) {
      loadExpertData();
    }
  }, [expert, open]);

  const loadExpertData = async () => {
    if (!expert) return;

    // Load testimonials
    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .eq("expert_id", expert.user_id);

    setTestimonials(testimonialsData || []);

    // Load public insights
    const { data: insightsData } = await supabase
      .from("insights")
      .select("*, profiles(*)")
      .eq("expert_id", expert.user_id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(5);

    setPublicInsights(insightsData || []);

    // Load marketplace items
    const { data: marketplaceData } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("expert_id", expert.user_id);

    setMarketplaceItems(marketplaceData || []);
  };

  if (!expert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Expert Profile</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Expert Header */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={expert.image_url} />
                <AvatarFallback className="text-3xl">{expert.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{expert.name}</h3>
                <p className="text-muted-foreground mt-2">{expert.bio || "No bio available"}</p>
                
                {expert.expert_profiles?.[0]?.expectations && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg">
                    <span className="text-sm font-semibold">What to Expect:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {expert.expert_profiles[0].expectations}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Markets: </span>
                    <span className="font-medium">
                      {Array.isArray(expert.expert_profiles?.[0]?.market_categories) && expert.expert_profiles[0].market_categories.length > 0
                        ? expert.expert_profiles[0].market_categories.join(", ")
                        : "General"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Insights: </span>
                    <span className="font-medium">{insightsCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subscribers: </span>
                    <span className="font-medium">{subscribersCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Posting: </span>
                    <span className="font-medium capitalize">{expert.expert_profiles?.[0]?.posting_frequency || "Weekly"}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant={isSubscribed ? "outline" : "default"}
                    onClick={() => onSubscribe(expert.user_id)}
                  >
                    {isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/marketplace?expert=${expert.user_id}`)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Marketplace
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Testimonials</h4>
                <div className="grid grid-cols-2 gap-3">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id}>
                      <CardContent className="p-3">
                        {testimonial.media_type === "image" ? (
                          <img 
                            src={testimonial.media_url} 
                            alt="Testimonial" 
                            className="w-full h-40 object-cover rounded" 
                          />
                        ) : testimonial.video_url ? (
                          <div className="aspect-video">
                            <iframe
                              src={testimonial.video_url}
                              className="w-full h-full rounded"
                              allowFullScreen
                            />
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Public Insights */}
            {publicInsights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Public Insights</h4>
                <div className="space-y-3">
                  {publicInsights.map((insight) => (
                    <Card key={insight.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{insight.title}</h5>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {insight.content}
                            </p>
                          </div>
                          <Badge style={{ backgroundColor: '#00B488' }} className="text-white">
                            Public
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Marketplace Items */}
            {marketplaceItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Marketplace Items</h4>
                <div className="space-y-3">
                  {marketplaceItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2">{item.item_type}</Badge>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <span className="font-semibold text-primary">${item.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
