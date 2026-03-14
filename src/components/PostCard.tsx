import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Bookmark, UserPlus, UserCheck, MoreHorizontal, Flag, Share2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


interface PostProfile {
  name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean | null;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  saves_count?: number;
  created_at: string;
  topic: string | null;
  user_id: string;
  mood_emoji?: string | null;
  is_anonymous?: boolean;
  profiles: PostProfile | null;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  onLike?: () => void;
  onSave?: () => void;
  onFollow?: () => void;
  onReport?: (reason: string) => void;
  onDelete?: () => void;
}

export function PostCard({
  post,
  isLiked = false,
  isSaved = false,
  isFollowing = false,
  onLike,
  onSave,
  onFollow,
  onReport,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count);
  
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [currentUserIsAnonymous, setCurrentUserIsAnonymous] = useState(false);

  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalLikesCount(post.likes_count);
    setLocalCommentsCount(post.comments_count);
  }, [post.likes_count, post.comments_count]);

  // Load current user's anonymous preference
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_anonymous')
        .eq('id', user.id)
        .single();
      if (data) {
        setCurrentUserIsAnonymous(data.is_anonymous || false);
      }
    };
    loadCurrentUserProfile();
  }, [user]);

  // Subscribe to realtime updates for this post
  useEffect(() => {
    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${post.id}`,
        },
        async () => {
          // Fetch updated likes count
          const { count } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          if (count !== null) {
            setLocalLikesCount(count);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${post.id}`,
        },
        async (payload) => {
          // Fetch updated comments count
          const { count } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          if (count !== null) {
            setLocalCommentsCount(count);
          }

          // If comments are showing, add the new comment
          if (showComments && payload.new) {
            const newCommentData = payload.new as Comment;
            const { data: profile } = await supabase
              .from("profiles_public")
              .select("name, avatar_url")
              .eq("id", newCommentData.user_id)
              .single();

            setComments((prev) => [
              ...prev,
              { ...newCommentData, profiles: profile },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, showComments]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data: commentsData } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("id, name, avatar_url")
          .in("id", userIds);

        const commentsWithProfiles = commentsData.map((comment) => ({
          ...comment,
          profiles: profiles?.find((p) => p.id === comment.user_id) || null,
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comentário enviado 💬",
        description: "Sua mensagem de apoio foi publicada.",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Erro ao comentar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    setLocalLikesCount((prev) => (localIsLiked ? prev - 1 : prev + 1));
    onLike?.();
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiado! 🔗",
        description: "Compartilhe com quem quiser.",
      });
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "Link copiado! 🔗",
        description: "Compartilhe com quem quiser.",
      });
    }
  };

  const getDisplayName = () => {
    if (!post.profiles) return t("community.anonymousUser");
    if (post.is_anonymous || post.profiles.is_anonymous) return t("community.anonymousUser");
    return post.profiles.name || t("community.anonymousUser");
  };

  const getTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("community.justNow");
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t("community.minAgo")}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t("community.hoursAgo")}`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t("community.daysAgo")}`;
    return date.toLocaleDateString();
  };

  const getCommentUserName = (comment: Comment) => {
    if (currentUserIsAnonymous && comment.user_id === user?.id) {
      return t("community.anonymousUser");
    }
    return comment.profiles?.name || t("community.user");
  };

  const isOwnPost = user?.id === post.user_id;

  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getDisplayName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="font-medium text-sm truncate">{getDisplayName()}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">· {getTimestamp(post.created_at)}</span>
              {post.mood_emoji && <span className="text-base">{post.mood_emoji}</span>}
              {post.topic && <Badge variant="secondary" className="text-xs">{post.topic}</Badge>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isOwnPost && !post.is_anonymous && post.profiles && (
                <Button
                  variant={isFollowing ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2 hidden sm:flex"
                  onClick={onFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3 mr-1" />
                      {t("community.following")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      {t("community.follow")}
                    </>
                  )}
                </Button>
              )}
              {!isOwnPost && !post.is_anonymous && post.profiles && (
                <Button
                  variant={isFollowing ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 sm:hidden"
                  onClick={onFollow}
                >
                  {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnPost && (
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("community.deletePost")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onReport?.("inappropriate")}>
                    <Flag className="w-4 h-4 mr-2" />
                    {t("community.report")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.image_url && (
            <img src={post.image_url} alt="Post" className="rounded-lg w-full mb-4" />
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-primary h-9 px-2.5",
                  localIsLiked && "text-pink-500 hover:text-pink-600"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("w-4 h-4 mr-1", localIsLiked && "fill-current")} />
                <span className="text-xs">{localLikesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary h-9 px-2.5"
                onClick={handleToggleComments}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">{localCommentsCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary h-9 px-2.5"
                onClick={handleShareLink}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-primary h-9 px-2.5",
                isSaved && "text-primary"
              )}
              onClick={onSave}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground text-center">{t("community.loadingComments")}</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  {t("community.beFirstToComment")} 💬
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUserIsAnonymous && comment.user_id === user?.id ? undefined : comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getCommentUserName(comment).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {getCommentUserName(comment)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getTimestamp(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Comment Input */}
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUserIsAnonymous ? undefined : user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {currentUserIsAnonymous ? "🌸" : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  placeholder={t("community.writeSupportMessage")}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </Card>
  );
}
