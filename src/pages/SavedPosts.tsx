import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { PostCard } from "@/components/PostCard";
import { Bookmark, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SavedPost {
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
  mood_emoji: string | null;
  profiles: {
    name: string | null;
    avatar_url: string | null;
    is_anonymous: boolean | null;
  } | null;
}

export default function SavedPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const loadUserInteractions = async () => {
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
  };

  const loadSavedPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: saves } = await supabase
        .from("post_saves")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!saves || saves.length === 0) {
        setSavedPosts([]);
        setLoading(false);
        return;
      }

      const postIds = saves.map((s) => s.post_id);

      const { data: postsData, error } = await supabase
        .from("community_posts")
        .select("*")
        .in("id", postIds)
        .eq("is_flagged", false);

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setSavedPosts([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles_public")
        .select("id, name, avatar_url, is_anonymous")
        .in("id", userIds);

      const postsWithProfiles = postIds
        .map((id) => {
          const post = postsData.find((p) => p.id === id);
          if (!post) return null;
          const profile = profilesData?.find((p) => p.id === post.user_id);
          return {
            ...post,
            profiles: post.is_anonymous
              ? { name: null, avatar_url: null, is_anonymous: true }
              : profile || null,
          };
        })
        .filter(Boolean) as SavedPost[];

      setSavedPosts(postsWithProfiles);
    } catch (error) {
      console.error("Error loading saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

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
        setSavedPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p))
        );
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        setUserLikes((prev) => new Set(prev).add(postId));
        setSavedPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
        );
      }

      const post = savedPosts.find((p) => p.id === postId);
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

  const unsavePost = async (postId: string) => {
    if (!user) return;

    try {
      await supabase.from("post_saves").delete().eq("post_id", postId).eq("user_id", user.id);
      setUserSaves((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Removido dos salvos" });

      const post = savedPosts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("community_posts")
          .update({ saves_count: (post.saves_count || 1) - 1 })
          .eq("id", postId);
      }
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  };

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
          title: "Agora você está seguindo 🌸",
          description: "Seus posts aparecerão na aba Seguindo.",
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

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

  useEffect(() => {
    loadUserInteractions();
    loadSavedPosts();
  }, [user]);

  return (
    <DashboardLayout title="Posts Salvos" maxWidth="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard/community">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Posts Salvos</h1>
            <p className="text-muted-foreground text-sm">
              Seus posts favoritos guardados com carinho
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              Carregando posts salvos...
            </div>
          </Card>
        ) : savedPosts.length === 0 ? (
          <Card className="p-8 md:p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Nenhum post salvo ainda</h3>
                <p className="text-muted-foreground text-sm">
                  Quando você salvar posts na comunidade, eles aparecerão aqui 💕
                </p>
              </div>
              <Link to="/dashboard/community">
                <Button variant="outline">Explorar Comunidade</Button>
              </Link>
            </div>
          </Card>
        ) : (
          savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={userLikes.has(post.id)}
              isSaved={true}
              isFollowing={followingIds.has(post.user_id)}
              onLike={() => likePost(post.id)}
              onSave={() => unsavePost(post.id)}
              onFollow={() => followUser(post.user_id)}
              onReport={(reason) => reportPost(post.id, reason)}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
