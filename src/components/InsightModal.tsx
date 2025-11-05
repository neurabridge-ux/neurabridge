import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Eye, Globe, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInsightInteractions } from "@/hooks/useInsightInteractions";

interface InsightModalProps {
  insight: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsightModal = ({ insight, open, onOpenChange }: InsightModalProps) => {
  const {
    comments,
    liked,
    likeCount,
    setLikeCount,
    newComment,
    setNewComment,
    handleLike,
    handleComment,
  } = useInsightInteractions(insight?.id || "");

  // Update like count when insight prop changes
  if (insight && likeCount === 0 && insight.likes_count) {
    setLikeCount(insight.likes_count);
  }

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
