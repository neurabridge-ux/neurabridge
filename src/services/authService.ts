import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, userData: { user_type: string; name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async createExpertProfile(userId: string) {
    const { error } = await supabase
      .from("expert_profiles")
      .insert({ user_id: userId });

    if (error) throw error;
  },

  async createInvestorProfile(userId: string) {
    const { error } = await supabase
      .from("investor_profiles")
      .insert({ user_id: userId });

    if (error) throw error;
  },
};
