import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Heart, Bookmark, Users, Settings, Edit2, Crown, Camera, ArrowLeft, Home, MessageCircle, HelpCircle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan_type: string | null;
  is_anonymous: boolean | null;
}

interface Stats {
  posts: number;
  followers: number;
  following: number;
  saved: number;
}

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0, followers: 0, following: 0, saved: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadSavedPosts();
      loadMyPosts();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditName(data.name || "");
      setIsAnonymous(data.is_anonymous || false);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user) return;

    const [postsRes, followersRes, followingRes, savedRes] = await Promise.all([
      supabase.from("community_posts").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("follows").select("id", { count: "exact" }).eq("following_id", user.id),
      supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", user.id),
      supabase.from("post_saves").select("id", { count: "exact" }).eq("user_id", user.id),
    ]);

    setStats({
      posts: postsRes.count || 0,
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
      saved: savedRes.count || 0,
    });
  };

  const loadSavedPosts = async () => {
    if (!user) return;

    const { data: saves } = await supabase
      .from("post_saves")
      .select("post_id")
      .eq("user_id", user.id);

    if (saves && saves.length > 0) {
      const postIds = saves.map((s) => s.post_id);
      const { data: posts } = await supabase
        .from("community_posts")
        .select("*")
        .in("id", postIds);

      setSavedPosts(posts || []);
    }
  };

  const loadMyPosts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setMyPosts(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      localStorage.setItem("profileImage", publicUrl);
      window.dispatchEvent(new Event('profileImageUpdate'));

      toast({
        title: "Foto atualizada! 🌸",
        description: "Sua nova foto de perfil foi salva.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar foto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: editName, is_anonymous: isAnonymous })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, name: editName, is_anonymous: isAnonymous } : null);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado! 🌸",
        description: "Suas informações foram salvas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <CommunitySidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CommunitySidebar />

        <div className="flex-1 flex flex-col">
          {/* Header with back button */}
          <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/community")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Meu Perfil</h1>
          </header>

          <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
            {/* Profile Header */}
            <Card className="mb-6 rounded-2xl border-border/40">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Seu nome"
                          className="max-w-xs"
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                          <Label htmlFor="anonymous">Modo anônimo na comunidade</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>Salvar</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <h2 className="text-2xl font-semibold">
                            {profile?.name || "Usuária Bloomelle"}
                          </h2>
                          {profile?.plan_type === "premium" && (
                            <Badge className="bg-primary/10 text-primary">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">{profile?.email}</p>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar perfil
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{stats.posts}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{stats.followers}</p>
                    <p className="text-sm text-muted-foreground">Seguidoras</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{stats.following}</p>
                    <p className="text-sm text-muted-foreground">Seguindo</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{stats.saved}</p>
                    <p className="text-sm text-muted-foreground">Salvos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="posts">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="posts" className="flex-1">
                  <User className="w-4 h-4 mr-2" />
                  Minhas Postagens
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Salvos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts">
                {myPosts.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">Nenhuma postagem ainda</h3>
                      <p className="text-muted-foreground">
                        Quando quiser, compartilhe algo com a comunidade 💗
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myPosts.map((post) => (
                      <Card key={post.id} className="rounded-xl">
                        <CardContent className="p-4">
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{getTimestamp(post.created_at)}</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes_count}
                            </span>
                            <span>{post.comments_count} comentários</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved">
                {savedPosts.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">Nenhum post salvo</h3>
                      <p className="text-muted-foreground">
                        Posts que você salvar aparecerão aqui 💗
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
                      <Card key={post.id} className="rounded-xl">
                        <CardContent className="p-4">
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{getTimestamp(post.created_at)}</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes_count}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

// Community Sidebar Component
function CommunitySidebar() {
  const navigate = useNavigate();
  
  return (
    <aside className="hidden lg:block w-64 border-r border-border/40 p-4 space-y-4">
      <Card className="p-4">
        <nav className="space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Home className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/dashboard/community" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Comunidade</span>
          </Link>
          <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary">
            <User className="w-5 h-5" />
            <span className="font-medium">Meu Perfil</span>
          </Link>
          <button onClick={() => navigate("/dashboard/groups")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Grupos</span>
          </button>
          <Separator className="my-3" />
          <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Configurações</span>
          </Link>
          <Link to="/help" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Ajuda</span>
          </Link>
        </nav>
      </Card>
    </aside>
  );
}