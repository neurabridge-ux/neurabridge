import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { expertService } from "@/services/expertService";
import { subscriptionService } from "@/services/subscriptionService";
import { insightService } from "@/services/insightService";
import { authService } from "@/services/authService";

export const useBrowseExperts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);
  const [subscribedExpertIds, setSubscribedExpertIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expertInsightsCount, setExpertInsightsCount] = useState<Record<string, number>>({});
  const [subscriberCounts, setSubscriberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      const user = await authService.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      // Load all experts
      const expertsData = await expertService.getAllExperts();
      setExperts(expertsData);

      // Load insights and subscriber counts
      if (expertsData) {
        const insightCounts: Record<string, number> = {};
        const subCounts: Record<string, number> = {};

        for (const expert of expertsData) {
          const insightCount = await insightService.getInsightCount(expert.user_id);
          const subCount = await subscriptionService.getSubscriberCount(expert.user_id);

          insightCounts[expert.user_id] = insightCount;
          subCounts[expert.user_id] = subCount;
        }

        setExpertInsightsCount(insightCounts);
        setSubscriberCounts(subCounts);
      }

      // Load current subscriptions
      const subsData = await subscriptionService.getSubscriptions(user.id);
      setSubscribedExpertIds(new Set(subsData?.map((s) => s.expert_id) || []));
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
        await subscriptionService.unsubscribe(currentUserId, expertId);

        setSubscribedExpertIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(expertId);
          return newSet;
        });

        toast.success("Unsubscribed successfully");
      } else {
        await subscriptionService.subscribe(currentUserId, expertId);

        const expert = experts.find((e) => e.user_id === expertId);
        setSubscribedExpertIds((prev) => new Set(prev).add(expertId));
        toast.success(`Subscribed to ${expert?.name}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubscriptionRequest = async (expertId: string) => {
    try {
      if (!currentUserId) return;

      await subscriptionService.createSubscriptionRequest(currentUserId, expertId);
      toast.success("Enrolment request sent to expert");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    loading,
    experts: filteredExperts,
    subscribedExpertIds,
    searchTerm,
    setSearchTerm,
    currentUserId,
    expertInsightsCount,
    subscriberCounts,
    handleSubscribe,
    handleSubscriptionRequest,
  };
};
