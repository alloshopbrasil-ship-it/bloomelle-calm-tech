import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  created_at: string;
  topic: string | null;
  user_id: string;
  is_anonymous: boolean;
  visibility: string;
  mood_emoji: string | null;
  is_flagged: boolean;
  profiles: {
    name: string | null;
    avatar_url: string | null;
    is_anonymous: boolean | null;
  } | null;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Load user's likes and saves
  const loadUserInteractions = useCallback(async () => {
    if (!user) return;

    const [likesRes, savesRes, followsRes] = await Promise.all([
      supabase.from("post_likes").select("post_id").eq("user_id", user.id),
      supabase.from("post_saves").select("post_id").eq("user_id", user.id),
      supabase.from("follows").select("following_id").eq("follower_id", user.id),
    ]);

    if (likesRes.data) {
      setUserLikes(new Set(likesRes.data.map((l) => l.post_id)));
    }
    if (savesRes.data) {
      setUserSaves(new Set(savesRes.data.map((s) => s.post_id)));
    }
    if (followsRes.data) {
      setFollowingIds(new Set(followsRes.data.map((f) => f.following_id)));
    }
  }, [user]);

  // Load posts with profiles
  const loadPosts = useCallback(async (tab: string = "popular", searchQuery: string = "") => {
    if (!user) return;
    
    setLoading(true);

    try {
      let query = supabase
        .from("community_posts")
        .select("*")
        .eq("is_flagged", false);

      // Filter by tab
      if (tab === "my-posts") {
        query = query.eq("user_id", user.id);
      } else if (tab === "following" && followingIds.size > 0) {
        query = query.in("user_id", Array.from(followingIds));
      }

      // Search filter
      if (searchQuery) {
        query = query.ilike("content", `%${searchQuery}%`);
      }

      // Order by popularity for "popular" tab
      if (tab === "popular") {
        query = query.order("likes_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: postsData, error } = await query.limit(50);

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get profiles
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles_public")
        .select("id, name, avatar_url, is_anonymous")
        .in("id", userIds);

      // Calculate relevance score for popular tab
      const postsWithProfiles = postsData.map((post) => {
        const profile = profilesData?.find((p) => p.id === post.user_id);
        
        // Emotional relevance score
        const timeDiff = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0, 1 - timeDiff / 168); // Decay over 7 days
        const score = (post.likes_count * 2) + (post.comments_count * 3) + ((post.saves_count || 0) * 4);
        const relevanceScore = score * timeDecay;

        return {
          ...post,
          profiles: post.is_anonymous ? { name: null, avatar_url: null, is_anonymous: true } : profile || null,
          isLiked: userLikes.has(post.id),
          isSaved: userSaves.has(post.id),
          relevanceScore,
        };
      });

      // Sort by relevance for popular tab
      if (tab === "popular") {
        postsWithProfiles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      }

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userLikes, userSaves, followingIds]);

  // Like post
  const likePost = async (postId: string) => {
    if (!user) return;

    const isLiked = userLikes.has(postId);

    try {
      if (isLiked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
        setUserLikes((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count - 1, isLiked: false } : p))
        );
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        setUserLikes((prev) => new Set(prev).add(postId));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1, isLiked: true } : p))
        );
        toast({
          title: "Você espalhou apoio hoje 💕",
          description: "Sua curtida faz diferença.",
        });
      }

      // Update likes count in DB
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("community_posts")
          .update({ likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 })
          .eq("id", postId);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Save post
  const savePost = async (postId: string) => {
    if (!user) return;

    const isSaved = userSaves.has(postId);

    try {
      if (isSaved) {
        await supabase.from("post_saves").delete().eq("post_id", postId).eq("user_id", user.id);
        setUserSaves((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, saves_count: (p.saves_count || 1) - 1, isSaved: false } : p))
        );
        toast({ title: "Removido dos salvos" });
      } else {
        await supabase.from("post_saves").insert({ post_id: postId, user_id: user.id });
        setUserSaves((prev) => new Set(prev).add(postId));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, saves_count: (p.saves_count || 0) + 1, isSaved: true } : p))
        );
        toast({
          title: "Salvo com carinho 💗",
          description: "Acesse em sua área privada.",
        });
      }

      // Update saves count
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("community_posts")
          .update({ saves_count: isSaved ? (post.saves_count || 1) - 1 : (post.saves_count || 0) + 1 })
          .eq("id", postId);
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  // Follow user
  const followUser = async (userId: string) => {
    if (!user || userId === user.id) return;

    const isFollowing = followingIds.has(userId);

    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
        setFollowingIds((prev) => new Set(prev).add(userId));
        toast({
          title: "Vocês agora são amigas 🌸",
          description: "Os posts dela aparecerão na aba Amigas.",
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Report post
  const reportPost = async (postId: string, reason: string) => {
    if (!user) return;

    try {
      await supabase.from("moderation_flags").insert({
        reporter_id: user.id,
        reported_post_id: postId,
        reason,
      });
      toast({
        title: "Denúncia recebida",
        description: "Obrigada por ajudar a manter nossa comunidade segura.",
      });
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  // Delete own post
  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({
        title: "Post excluído com sucesso 🌿",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro ao excluir post",
        variant: "destructive",
      });
    }
  };

  // Block user
  const blockUser = async (userId: string) => {
    if (!user) return;

    try {
      await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: userId,
      });
      toast({
        title: "Usuária bloqueada",
        description: "Você não verá mais o conteúdo desta usuária.",
      });
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  useEffect(() => {
    loadUserInteractions();
  }, [loadUserInteractions]);

  return {
    posts,
    loading,
    loadPosts,
    likePost,
    savePost,
    followUser,
    reportPost,
    deletePost,
    blockUser,
    followingIds,
    userLikes,
    userSaves,
  };
}
