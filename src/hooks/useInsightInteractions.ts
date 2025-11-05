import { useState, useEffect } from "react";
import { toast } from "sonner";
import { insightService } from "@/services/insightService";
import { commentService } from "@/services/commentService";
import { authService } from "@/services/authService";

export const useInsightInteractions = (insightId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (insightId) {
      loadComments();
      checkIfLiked();
    }
  }, [insightId]);

  const loadComments = async () => {
    try {
      const data = await commentService.getComments(insightId);
      setComments(data);
    } catch (error: any) {
      console.error("Error loading comments:", error);
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

  const handleComment = async () => {
    try {
      const user = await authService.getUser();
      if (!user) {
        toast.error("Please login to comment");
        return;
      }

      if (!newComment.trim()) {
        toast.error("Please enter a comment");
        return;
      }

      await commentService.createComment({
        insight_id: insightId,
        user_id: user.id,
        content: newComment,
      });

      setNewComment("");
      loadComments();
      toast.success("Comment added");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    comments,
    liked,
    likeCount,
    setLikeCount,
    newComment,
    setNewComment,
    handleLike,
    handleComment,
    loadComments,
  };
};
