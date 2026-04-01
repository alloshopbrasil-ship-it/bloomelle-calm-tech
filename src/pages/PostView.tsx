import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

export default function PostView() {
  const { postId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    loadPost();
  }, [postId, user, authLoading]);

  const loadPost = async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (data) {
      // Mask user_id for anonymous posts
      const safeUserId = data.is_anonymous ? null : data.user_id;
      const profile = safeUserId ? (await supabase
        .from("profiles_public")
        .select("name, avatar_url, is_anonymous")
        .eq("id", safeUserId)
        .single()).data : null;
      setPost({ ...data, user_id: safeUserId, profiles: data.is_anonymous ? { name: null, avatar_url: null, is_anonymous: true } : profile });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Post não encontrado.</p>
          <Button onClick={() => navigate("/")}>Voltar ao início</Button>
        </Card>
      </div>
    );
  }

  const displayName = post.is_anonymous || post.profiles?.is_anonymous
    ? "Anônima 🌸"
    : post.profiles?.name || "Usuária";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard/community")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à comunidade
        </Button>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {new Date(post.created_at).toLocaleDateString("pt-BR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </p>
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="Post" className="rounded-lg w-full mt-4" />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
