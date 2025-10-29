import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, ArrowLeft, ShoppingBag, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const Marketplace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expertDetails, setExpertDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  const loadMarketplaceItems = async () => {
    try {
      const { data: itemsData } = await supabase
        .from("marketplace_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsData) {
        setItems(itemsData);
        
        // Load expert details for each item
        const uniqueExpertIds = [...new Set(itemsData.map(item => item.expert_id))];
        const experts: Record<string, any> = {};
        
        for (const expertId of uniqueExpertIds) {
          const { data: expertData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", expertId)
            .single();
          
          if (expertData) {
            experts[expertId] = expertData;
          }
        }
        
        setExpertDetails(experts);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_type.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Marketplace</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="card-shadow mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search courses, trainings, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">No items available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const expert = expertDetails[item.expert_id];

              return (
                <Card 
                  key={item.id} 
                  className="card-shadow hover:card-shadow-hover transition-smooth cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {item.media_url && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                      {item.media_type === "video" ? (
                        <div className="flex items-center justify-center h-full bg-black/80">
                          <Play className="h-16 w-16 text-white" />
                        </div>
                      ) : (
                        <img 
                          src={item.media_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{item.item_type}</Badge>
                      <span className="text-lg font-bold text-primary">
                        ${item.price}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {expert && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={expert.image_url} />
                          <AvatarFallback>{expert.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{expert.name}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedItem.media_url && (
                <div className="w-full">
                  {selectedItem.media_type === "video" ? (
                    <video 
                      src={selectedItem.media_url} 
                      controls 
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <img 
                      src={selectedItem.media_url} 
                      alt={selectedItem.title}
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{selectedItem.item_type}</Badge>
                <span className="text-2xl font-bold text-primary">
                  ${selectedItem.price}
                </span>
              </div>

              {expertDetails[selectedItem.expert_id] && (
                <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expertDetails[selectedItem.expert_id].image_url} />
                    <AvatarFallback>
                      {expertDetails[selectedItem.expert_id].name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{expertDetails[selectedItem.expert_id].name}</p>
                    <p className="text-sm text-muted-foreground">Expert</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedItem.description}</p>
              </div>

              <Button className="w-full" size="lg">
                Contact Expert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Marketplace;
