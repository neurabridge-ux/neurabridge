import { supabase } from "@/integrations/supabase/client";

export const subscriptionService = {
  async getSubscriptions(investorId: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, profiles(*)")
      .eq("investor_id", investorId);

    if (error) throw error;
    return data || [];
  },

  async getSubscribers(expertId: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, profiles(*)")
      .eq("expert_id", expertId);

    if (error) throw error;
    return data || [];
  },

  async getSubscriberCount(expertId: string) {
    const { count, error } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("expert_id", expertId);

    if (error) throw error;
    return count || 0;
  },

  async subscribe(investorId: string, expertId: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ investor_id: investorId, expert_id: expertId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unsubscribe(investorId: string, expertId: string) {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("investor_id", investorId)
      .eq("expert_id", expertId);

    if (error) throw error;
  },

  async removeSubscriber(subscriptionId: string) {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) throw error;
  },

  async createSubscriptionRequest(investorId: string, expertId: string) {
    const { data, error } = await supabase
      .from("subscription_requests")
      .insert({ investor_id: investorId, expert_id: expertId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSubscriptionRequests(expertId: string) {
    const { data, error } = await supabase
      .from("subscription_requests")
      .select("*, profiles(*)")
      .eq("expert_id", expertId)
      .eq("status", "pending");

    if (error) throw error;
    return data || [];
  },
};
