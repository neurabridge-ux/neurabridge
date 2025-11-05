import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InsightModal } from "@/components/InsightModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye } from "lucide-react";

interface PublicInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PublicInsightsModal = ({ open, onOpenChange }: PublicInsightsModalProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadPublicInsights();
    }
  }, [open]);

  const loadPublicInsights = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("insights")
        .select("*, profiles(*)")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      setInsights(data || []);
    } catch (error) {
      console.error("Error loading public insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Public Insights</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="space-y-4 pr-4">
              {loading ? (
                <div className="text-center py-8">Loading insights...</div>
              ) : insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No public insights available yet
                </div>
              ) : (
                insights.map((insight) => (
                  <Card 
                    key={insight.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={insight.profiles?.image_url} />
                            <AvatarFallback>{insight.profiles?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{insight.profiles?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(insight.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge style={{ backgroundColor: '#00B488' }} className="text-white">
                          Public
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                      
                      {insight.image_url && (
                        <img
                          src={insight.image_url}
                          alt={insight.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}
                      
                      <p className="text-muted-foreground line-clamp-3 mb-3">
                        {insight.content}
                      </p>

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
                          <span>Comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedInsight && (
        <InsightModal
          insight={selectedInsight}
          open={!!selectedInsight}
          onOpenChange={(open) => !open && setSelectedInsight(null)}
        />
      )}
    </>
  );
};
