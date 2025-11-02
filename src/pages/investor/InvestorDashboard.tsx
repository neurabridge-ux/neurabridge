import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Users, Search, LogOut, Heart, MessageCircle, Send, Edit2, Trash2, Eye, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { NotificationBell } from "@/components/NotificationBell";
import { Skeleton } from "@/components/ui/skeleton";
import neuraBridgeLogo from "@/assets/neurabridge-logo.png";

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "", investment_goal: "", image_url: "" });
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<Record<string, string | null>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [views, setViews] = useState<Record<string, number>>({});
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>("");
  const [publicInsights, setPublicInsights] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();

    // Set up realtime subscriptions
    const insightsChannel = supabase
      .channel('insights-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'insights' }, () => {
        loadInsights();
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        // Notifications handled by NotificationBell component
      })
      .subscribe();

    return () => {
      supabase.removeChannel(insightsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData?.user_type !== "investor") {
        navigate("/expert/dashboard");
        return;
      }

      setProfile(profileData);

      // Load investor profile
      const { data: investorData } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setInvestorProfile(investorData);
      setProfileData({
        name: profileData.name,
        bio: profileData.bio || "",
        investment_goal: investorData?.investment_goal || "",
        image_url: profileData.image_url || "",
      });

      await loadSubscriptions();
      await loadInsights();
      await loadPublicInsights();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("*, profiles!subscriptions_expert_id_fkey(*), expert_profiles!inner(*)")
      .eq("investor_id", user.id);

    setSubscriptions(data || []);
  };

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get subscribed expert IDs
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("expert_id")
      .eq("investor_id", user.id);

    if (!subs || subs.length === 0) {
      setInsights([]);
      return;
    }

    const expertIds = subs.map(s => s.expert_id);

    // Get insights from subscribed experts
    const { data } = await supabase
      .from("insights")
      .select("*, profiles!insights_expert_id_fkey(*)")
      .in("expert_id", expertIds)
      .order("created_at", { ascending: false });

    setInsights(data || []);

    // Track views and likes
    if (data && user) {
      const viewsData: Record<string, number> = {};
      const likesData: Record<string, boolean> = {};
      
      for (const insight of data) {
        viewsData[insight.id] = insight.views_count || 0;
        
        // Check if current user has liked this insight
        const { data: likeData } = await supabase
          .from("insight_likes")
          .select("id")
          .eq("insight_id", insight.id)
          .eq("user_id", user.id)
          .single();
        
        likesData[insight.id] = !!likeData;
        
        // Increment view count
        await supabase
          .from("insights")
          .update({ views_count: (insight.views_count || 0) + 1 })
          .eq("id", insight.id);
        
        viewsData[insight.id] = (insight.views_count || 0) + 1;
      }
      
      setViews(viewsData);
      setLikes(likesData);
    }

    // Load comments for each insight
    if (data) {
      for (const insight of data) {
        loadComments(insight.id);
      }
    }
  };

  const loadPublicInsights = async () => {
    try {
      const { data } = await supabase
        .from("insights")
        .select("*, profiles!insights_expert_id_fkey(*)")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(10);

      setPublicInsights((data as any) || []);
    } catch (error) {
      console.error("Error loading public insights:", error);
    }
  };

  const loadComments = async (insightId: string) => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey(*)")
      .eq("insight_id", insightId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true });

    if (data) {
      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select("*, profiles!comments_user_id_fkey(*)")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });
          
          return { ...comment, replies: replies || [] };
        })
      );
      setComments((prev) => ({ ...prev, [insightId]: commentsWithReplies }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ name: profileData.name, bio: profileData.bio, image_url: profileData.image_url })
        .eq("user_id", user.id);

      await supabase
        .from("investor_profiles")
        .update({ investment_goal: profileData.investment_goal })
        .eq("user_id", user.id);

      toast.success("Profile updated successfully");
      setEditingProfile(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddComment = async (insightId: string, parentCommentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const content = parentCommentId 
        ? newComment[`${insightId}-${parentCommentId}`]
        : newComment[insightId];
        
      if (!content) {
        toast.error("Please enter a comment");
        return;
      }

      await supabase.from("comments").insert({
        insight_id: insightId,
        user_id: user.id,
        content: content,
        parent_comment_id: parentCommentId || null,
      });

      toast.success(parentCommentId ? "Reply added" : "Comment added");
      
      if (parentCommentId) {
        setNewComment({ ...newComment, [`${insightId}-${parentCommentId}`]: "" });
        setReplyTo({ ...replyTo, [insightId]: null });
      } else {
        setNewComment({ ...newComment, [insightId]: "" });
      }
      
      loadComments(insightId);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLike = async (insightId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isLiked = likes[insightId];

      if (isLiked) {
        // Unlike
        await supabase
          .from("insight_likes")
          .delete()
          .eq("insight_id", insightId)
          .eq("user_id", user.id);

        setLikes(prev => ({ ...prev, [insightId]: false }));
      } else {
        // Like
        await supabase
          .from("insight_likes")
          .insert({ insight_id: insightId, user_id: user.id });

        setLikes(prev => ({ ...prev, [insightId]: true }));
      }
      
      // Reload insights to get updated like count
      loadInsights();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditComment = async (commentId: string, insightId: string, newContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!newContent.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      await supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId)
        .eq("user_id", user.id);

      toast.success("Comment updated");
      loadComments(insightId);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteComment = async (commentId: string, insightId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!confirm("Are you sure you want to delete this comment?")) {
        return;
      }

      await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      toast.success("Comment deleted");
      loadComments(insightId);
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 card-shadow">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src={neuraBridgeLogo} alt="NeuraBridge" className="h-8 w-auto" />
              <div>
                <h1 className="text-2xl font-bold">Investor Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/marketplace">
                <Button variant="outline">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Button>
              </Link>
              <Link to="/investor/browse">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Experts
                </Button>
              </Link>
              <NotificationBell />
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Insights Feed</CardTitle>
                <CardDescription>Latest insights from your subscribed experts</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No insights yet</p>
                    <Link to="/investor/browse">
                      <Button>Browse Experts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insights.map((insight, index) => (
                      <Card 
                        key={insight.id} 
                        className={`border-border ${index % 2 === 0 ? 'bg-muted/20' : 'bg-card'}`}
                      >
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={insight.profiles?.image_url} className="object-cover" />
                          <AvatarFallback>{insight.profiles?.name?.[0]}</AvatarFallback>
                        </Avatar>
                            <div>
                              <p className="font-semibold">{insight.profiles?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(insight.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground mb-4">{insight.content}</p>
                          
                          {insight.image_url && (
                            <img
                              src={insight.image_url}
                              alt="Insight"
                              className="w-full h-64 object-cover rounded-lg mb-4"
                            />
                          )}
                          
                          <div className="flex items-center gap-4 mb-4 pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleLike(insight.id)}
                              className="gap-2"
                            >
                              <Heart className={`h-4 w-4 ${likes[insight.id] ? 'fill-red-500 text-red-500' : ''}`} />
                              <span>{insight.likes_count || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="h-4 w-4" />
                              <span>{comments[insight.id]?.length || 0}</span>
                            </Button>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Eye className="h-4 w-4" />
                              <span>{views[insight.id] || insight.views_count || 0} views</span>
                            </div>
                          </div>

                          {comments[insight.id]?.length > 0 && (
                            <div className="space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
                              {comments[insight.id].map((comment: any) => (
                                <div key={comment.id} className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={comment.profiles?.image_url} className="object-cover" />
                                      <AvatarFallback>{comment.profiles?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      {editingCommentId === comment.id ? (
                                        <div className="space-y-2">
                                          <Input
                                            value={editCommentContent}
                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                            className="text-sm"
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                handleEditComment(comment.id, insight.id, editCommentContent);
                                                setEditingCommentId(null);
                                              }}
                                            >
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => setEditingCommentId(null)}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="bg-card p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium">{comment.profiles?.name}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                                              </div>
                                              {comment.user_id === profile?.user_id && (
                                                <div className="flex gap-1 ml-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                      setEditingCommentId(comment.id);
                                                      setEditCommentContent(comment.content);
                                                    }}
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-destructive"
                                                    onClick={() => handleDeleteComment(comment.id, insight.id)}
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs mt-1"
                                            onClick={() => setReplyTo({ ...replyTo, [insight.id]: comment.id })}
                                          >
                                            Reply
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Replies */}
                                  {comment.replies?.length > 0 && (
                                    <div className="ml-10 space-y-2">
                                      {comment.replies.map((reply: any) => (
                                        <div key={reply.id} className="flex items-start space-x-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={reply.profiles?.image_url} className="object-cover" />
                                            <AvatarFallback>{reply.profiles?.name?.[0]}</AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            {editingCommentId === reply.id ? (
                                              <div className="space-y-2">
                                                <Input
                                                  value={editCommentContent}
                                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                                  className="text-sm"
                                                />
                                                <div className="flex gap-2">
                                                  <Button
                                                    size="sm"
                                                    onClick={() => {
                                                      handleEditComment(reply.id, insight.id, editCommentContent);
                                                      setEditingCommentId(null);
                                                    }}
                                                  >
                                                    Save
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingCommentId(null)}
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="bg-card p-2 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                  <div className="flex-1">
                                                    <p className="text-xs font-medium">{reply.profiles?.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{reply.content}</p>
                                                  </div>
                                                  {reply.user_id === profile?.user_id && (
                                                    <div className="flex gap-1 ml-2">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0"
                                                        onClick={() => {
                                                          setEditingCommentId(reply.id);
                                                          setEditCommentContent(reply.content);
                                                        }}
                                                      >
                                                        <Edit2 className="h-2 w-2" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0 text-destructive"
                                                        onClick={() => handleDeleteComment(reply.id, insight.id)}
                                                      >
                                                        <Trash2 className="h-2 w-2" />
                                                      </Button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reply Input */}
                                  {replyTo[insight.id] === comment.id && (
                                    <div className="ml-10 flex gap-2 mt-2">
                                      <Input
                                        placeholder="Write a reply..."
                                        value={newComment[`${insight.id}-${comment.id}`] || ""}
                                        onChange={(e) =>
                                          setNewComment({
                                            ...newComment,
                                            [`${insight.id}-${comment.id}`]: e.target.value,
                                          })
                                        }
                                        className="text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddComment(insight.id, comment.id)}
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment[insight.id] || ""}
                              onChange={(e) =>
                                setNewComment({ ...newComment, [insight.id]: e.target.value })
                              }
                            />
                            <Button onClick={() => handleAddComment(insight.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {editingProfile ? (
                  <div className="space-y-4">
                    <ImageUpload
                      bucket="profile-images"
                      currentImageUrl={profileData.image_url}
                      onUploadComplete={(url) =>
                        setProfileData({ ...profileData, image_url: url })
                      }
                      isProfile
                      label="Profile Picture"
                    />
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Investment Goal</Label>
                      <Textarea
                        value={profileData.investment_goal}
                        onChange={(e) =>
                          setProfileData({ ...profileData, investment_goal: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} size="sm">
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.image_url} />
                        <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile?.name}</p>
                        <p className="text-xs text-muted-foreground">{profile?.bio || "No bio"}</p>
                      </div>
                    </div>
                    {investorProfile?.investment_goal && (
                      <div>
                        <Label className="text-xs">Investment Goal</Label>
                        <p className="text-sm text-muted-foreground">
                          {investorProfile.investment_goal}
                        </p>
                      </div>
                    )}
                    <Button size="sm" onClick={() => setEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscribed Experts */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subscribed Experts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search experts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredSubscriptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subscribed experts yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSubscriptions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-smooth border border-border"
                        onClick={() => setSelectedExpert(sub)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={sub.profiles?.image_url} />
                          <AvatarFallback>{sub.profiles?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{sub.profiles?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {Array.isArray(sub.expert_profiles?.market_categories) && sub.expert_profiles.market_categories.length > 0
                              ? sub.expert_profiles.market_categories.join(", ")
                              : "General Markets"}
                          </p>
                          <p className="text-xs font-medium text-primary mt-1">
                            {sub.expert_profiles?.subscription_fee === 0 || sub.expert_profiles?.subscription_fee === null
                              ? "Free"
                              : `$${sub.expert_profiles?.subscription_fee}/${sub.expert_profiles?.subscription_duration}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Expert Detail Dialog */}
      {selectedExpert && (
        <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Expert Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedExpert.profiles?.image_url} />
                  <AvatarFallback className="text-3xl">
                    {selectedExpert.profiles?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedExpert.profiles?.name}</h3>
                  <p className="text-muted-foreground mt-2">{selectedExpert.profiles?.bio || "No bio available"}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Markets</Label>
                      <p className="font-medium">
                        {Array.isArray(selectedExpert.expert_profiles?.market_categories) && selectedExpert.expert_profiles.market_categories.length > 0
                          ? selectedExpert.expert_profiles.market_categories.join(", ")
                          : "General"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Posting Frequency</Label>
                      <p className="font-medium capitalize">{selectedExpert.expert_profiles?.posting_frequency || "Weekly"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 items-center">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subscription</Label>
                      <p className="text-lg font-semibold text-primary">
                        {selectedExpert.expert_profiles?.subscription_fee === 0 || selectedExpert.expert_profiles?.subscription_fee === null
                          ? "Free"
                          : `$${selectedExpert.expert_profiles?.subscription_fee} / ${selectedExpert.expert_profiles?.subscription_duration}`}
                      </p>
                    </div>
                  </div>

                  {selectedExpert.expert_profiles?.expectations && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">What to Expect</Label>
                      <p className="text-sm mt-1">{selectedExpert.expert_profiles.expectations}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => navigate(`/marketplace?expert=${selectedExpert.profiles?.user_id}`)}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Marketplace
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedExpert(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InvestorDashboard;
