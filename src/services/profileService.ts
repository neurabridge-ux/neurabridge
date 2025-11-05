import { supabase } from "@/integrations/supabase/client";

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: { name?: string; bio?: string; image_url?: string }) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInvestorProfile(userId: string) {
    const { data, error } = await supabase
      .from("investor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvestorProfile(userId: string, updates: { investment_goal?: string }) {
    const { data, error } = await supabase
      .from("investor_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
