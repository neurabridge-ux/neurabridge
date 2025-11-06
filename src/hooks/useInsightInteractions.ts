import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { insightService } from "@/services/insightService";
import { commentService } from "@/services/commentService";
import { authService } from "@/services/authService";

export const useInsightInteractions = (insightId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (insightId) {
      loadComments();
      checkIfLiked();
    }
  }, [insightId]);

  const loadComments = async () => {
    if (!insightId) return;
    
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("insight_id", insightId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true });

    if (data) {
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select("*, profiles(*)")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });
          
          return { ...comment, replies: replies || [] };
        })
      );
      setComments(commentsWithReplies);
    }
  };

  const checkIfLiked = async () => {
    try {
      const user = await authService.getUser();
      if (!user) return;

      const isLiked = await insightService.checkIfLiked(insightId, user.id);
      setLiked(isLiked);
    } catch (error: any) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    try {
      const user = await authService.getUser();
      if (!user) {
        toast.error("Please login to like insights");
        return;
      }

      if (liked) {
        await insightService.unlikeInsight(insightId, user.id);
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await insightService.likeInsight(insightId, user.id);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleComment = async (parentCommentId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !insightId) return;

    const content = parentCommentId ? replyContent[parentCommentId] : newComment;
    if (!content?.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    await supabase.from("comments").insert({
      insight_id: insightId,
      user_id: user.id,
      content: content,
      parent_comment_id: parentCommentId || null,
    });
    
    if (parentCommentId) {
      setReplyContent({ ...replyContent, [parentCommentId]: "" });
      setReplyTo(null);
    } else {
      setNewComment("");
    }
    
    loadComments();
    toast.success(parentCommentId ? "Reply added" : "Comment added");
  };

  return {
    comments,
    liked,
    likeCount,
    setLikeCount,
    newComment,
    setNewComment,
    replyTo,
    setReplyTo,
    replyContent,
    setReplyContent,
    handleLike,
    handleComment,
  };
};
