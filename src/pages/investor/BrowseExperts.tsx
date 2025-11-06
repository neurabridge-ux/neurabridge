import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpertDetailModal } from "@/components/ExpertDetailModal";
import { useBrowseExperts } from "@/hooks/useBrowseExperts";

const BrowseExperts = () => {
  const navigate = useNavigate();
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  const {
    loading,
    experts,
    subscribedExpertIds,
    searchTerm,
    setSearchTerm,
    currentUserId,
    expertInsightsCount,
    subscriberCounts,
    handleSubscribe,
    handleSubscriptionRequest,
  } = useBrowseExperts();

  const viewExpertDetails = (expert: any) => {
    setSelectedExpert(expert);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="card-shadow mb-8">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="card-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
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
        {experts.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">No experts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => {
              const expertProfile = expert.expert_profiles?.[0];
              const isSubscribed = subscribedExpertIds.has(expert.user_id);

              return (
                <Card 
                  key={expert.id} 
                  className="card-shadow hover:card-shadow-hover transition-smooth cursor-pointer"
                  onClick={() => viewExpertDetails(expert)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-14 w-14 flex-shrink-0">
                        <AvatarImage src={expert.image_url} />
                        <AvatarFallback className="text-lg">{expert.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg truncate">{expert.name}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {isSubscribed && (
                            <Badge variant="secondary" className="text-xs">
                              Subscribed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <CardDescription className="line-clamp-2 text-sm">
                      {expert.bio || "No bio available"}
                    </CardDescription>

                    {expert.expert_profiles?.[0]?.expectations && (
                      <div className="bg-accent/10 rounded-lg p-2">
                        <span className="text-xs font-semibold">What to Expect:</span>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {expert.expert_profiles[0].expectations}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground flex-shrink-0">Markets:</span>
                        <span className="font-medium text-right">
                          {Array.isArray(expert.expert_profiles?.[0]?.market_categories) && expert.expert_profiles[0].market_categories.length > 0
                            ? expert.expert_profiles[0].market_categories.join(", ")
                            : "General"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insights:</span>
                        <span className="font-medium">{expertInsightsCount[expert.user_id] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subscribers:</span>
                        <span className="font-medium">{subscriberCounts[expert.user_id] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posting:</span>
                        <span className="font-medium capitalize">{expert.expert_profiles?.[0]?.posting_frequency || "Weekly"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Subscription Fee</span>
                        <span className="font-semibold text-primary text-sm">
                          {expertProfile?.subscription_fee === 0 || expertProfile?.subscription_fee === null
                            ? "Free"
                            : `$${expertProfile?.subscription_fee || 0}`}
                        </span>
                      </div>
                      {expertProfile?.subscription_fee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <span className="text-xs capitalize">
                            {expertProfile?.subscription_duration || "monthly"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        className="w-full"
                        variant={isSubscribed ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscribe(expert.user_id);
                        }}
                      >
                        {isSubscribed ? "Unsubscribe" : "Subscribe"}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscriptionRequest(expert.user_id);
                        }}
                      >
                        Request Enrolment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <ExpertDetailModal
          expert={selectedExpert}
          open={!!selectedExpert}
          onOpenChange={(open) => !open && setSelectedExpert(null)}
          insightsCount={expertInsightsCount[selectedExpert.user_id] || 0}
          subscribersCount={subscriberCounts[selectedExpert.user_id] || 0}
          onSubscribe={handleSubscribe}
          isSubscribed={subscribedExpertIds.has(selectedExpert.user_id)}
        />
      )}
    </div>
  );
};

export default BrowseExperts;
