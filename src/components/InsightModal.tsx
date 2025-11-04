import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Eye, Globe, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InsightModalProps {
  insight: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsightModal = ({ insight, open, onOpenChange }: InsightModalProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(insight?.likes_count || 0);

  useEffect(() => {
    if (insight) {
      loadComments();
      checkIfLiked();
      setLikeCount(insight.likes_count || 0);
    }
  }, [insight]);

  const loadComments = async () => {
    if (!insight) return;

    const { data } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("insight_id", insight.id)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !insight) return;

    const { data } = await supabase
      .from("insight_likes")
      .select("*")
      .eq("insight_id", insight.id)
      .eq("user_id", user.id)
      .single();

    setLiked(!!data);
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to like insights");
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("insight_likes")
          .delete()
          .eq("insight_id", insight.id)
          .eq("user_id", user.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await supabase
          .from("insight_likes")
          .insert({ insight_id: insight.id, user_id: user.id });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleComment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await supabase.from("comments").insert({
        insight_id: insight.id,
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

  if (!insight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Insight Details</DialogTitle>
            {insight.visibility === 'public' && (
              <Badge className="gap-1" style={{ backgroundColor: '#00B488' }}>
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={insight.profiles?.image_url} />
                <AvatarFallback>{insight.profiles?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{insight.profiles?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(insight.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold">{insight.title}</h2>

            {/* Image */}
            {insight.image_url && (
              <img
                src={insight.image_url}
                alt={insight.title}
                className="w-full rounded-lg object-cover"
              />
            )}

            {/* Content */}
            <p className="text-muted-foreground whitespace-pre-wrap">{insight.content}</p>

            {/* Engagement Stats */}
            <div className="flex items-center space-x-6 pt-4 border-t">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{insight.views_count || 0}</span>
              </div>
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">{likeCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{comments.length}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Comments</h3>
              
              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button onClick={handleComment} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles?.image_url} />
                        <AvatarFallback>{comment.profiles?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm font-medium">{comment.profiles?.name}</p>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
