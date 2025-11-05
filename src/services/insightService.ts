import { supabase } from "@/integrations/supabase/client";

export const insightService = {
  async getPublicInsights() {
    const { data, error } = await supabase
      .from("insights")
      .select("*, profiles(*)")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInsightsByExpert(expertId: string) {
    const { data, error } = await supabase
      .from("insights")
      .select("*, profiles(*)")
      .eq("expert_id", expertId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSubscribedInsights(expertIds: string[]) {
    if (expertIds.length === 0) return [];

    const { data, error } = await supabase
      .from("insights")
      .select("*, profiles(*)")
      .in("expert_id", expertIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInsightById(insightId: string) {
    const { data, error } = await supabase
      .from("insights")
      .select("*, profiles(*)")
      .eq("id", insightId)
      .single();

    if (error) throw error;
    return data;
  },

  async createInsight(insight: {
    title: string;
    content: string;
    image_url?: string;
    visibility: string;
    expert_id: string;
  }) {
    const { data, error } = await supabase
      .from("insights")
      .insert(insight)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInsight(insightId: string, updates: any) {
    const { data, error } = await supabase
      .from("insights")
      .update(updates)
      .eq("id", insightId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInsight(insightId: string) {
    const { error } = await supabase
      .from("insights")
      .delete()
      .eq("id", insightId);

    if (error) throw error;
  },

  async incrementViews(insightId: string) {
    const { data } = await supabase
      .from("insights")
      .select("views_count")
      .eq("id", insightId)
      .single();

    if (data) {
      await supabase
        .from("insights")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", insightId);
    }
  },

  async likeInsight(insightId: string, userId: string) {
    const { error } = await supabase
      .from("insight_likes")
      .insert({ insight_id: insightId, user_id: userId });

    if (error) throw error;
  },

  async unlikeInsight(insightId: string, userId: string) {
    const { error } = await supabase
      .from("insight_likes")
      .delete()
      .eq("insight_id", insightId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async checkIfLiked(insightId: string, userId: string) {
    const { data, error } = await supabase
      .from("insight_likes")
      .select("*")
      .eq("insight_id", insightId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getInsightCount(expertId: string) {
    const { count, error } = await supabase
      .from("insights")
      .select("*", { count: "exact", head: true })
      .eq("expert_id", expertId);

    if (error) throw error;
    return count || 0;
  },
};
