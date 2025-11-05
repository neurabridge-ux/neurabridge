import { supabase } from "@/integrations/supabase/client";

export const expertService = {
  async getAllExperts() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        expert_profiles (
          subscription_fee,
          subscription_duration,
          posting_frequency,
          market_categories,
          expectations
        )
      `)
      .eq("user_type", "expert");

    if (error) throw error;
    return data || [];
  },

  async getExpertProfile(userId: string) {
    const { data, error } = await supabase
      .from("expert_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpertProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from("expert_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTestimonials(expertId: string) {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("expert_id", expertId);

    if (error) throw error;
    return data || [];
  },

  async createTestimonial(testimonial: {
    expert_id: string;
    media_url: string;
    media_type: string;
    video_url?: string;
  }) {
    const { data, error } = await supabase
      .from("testimonials")
      .insert(testimonial)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTestimonial(testimonialId: string) {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", testimonialId);

    if (error) throw error;
  },
};
