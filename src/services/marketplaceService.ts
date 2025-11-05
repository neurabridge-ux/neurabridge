import { supabase } from "@/integrations/supabase/client";

export const marketplaceService = {
  async getMarketplaceItems(expertId?: string) {
    let query = supabase
      .from("marketplace_items")
      .select("*, profiles(*)");

    if (expertId) {
      query = query.eq("expert_id", expertId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createMarketplaceItem(item: {
    expert_id: string;
    title: string;
    description: string;
    price: number;
    item_type: string;
    media_url?: string;
    media_type?: string;
  }) {
    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMarketplaceItem(itemId: string, updates: any) {
    const { data, error } = await supabase
      .from("marketplace_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMarketplaceItem(itemId: string) {
    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
  },
};
