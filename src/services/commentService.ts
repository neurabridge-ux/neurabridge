import { supabase } from "@/integrations/supabase/client";

export const commentService = {
  async getComments(insightId: string) {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("insight_id", insightId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createComment(comment: {
    insight_id: string;
    user_id: string;
    content: string;
    parent_comment_id?: string;
  }) {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
  },
};
