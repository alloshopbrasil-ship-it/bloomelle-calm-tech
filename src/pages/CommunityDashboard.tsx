import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Home,
  Users,
  User,
  Settings,
  HelpCircle,
  Hash,
  TrendingUp,
  Crown,
} from "lucide-react";
import { NewPostDrawer } from "@/components/NewPostDrawer";
import { GroupsList } from "@/components/GroupsList";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { PostCard } from "@/components/PostCard";
import { NotificationBell } from "@/components/NotificationBell";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useCommunity } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

export default function CommunityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("popular");
  const [newPostDrawerOpen, setNewPostDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [userProfile, setUserProfile] = useState<{ avatar_url: string | null }>({ avatar_url: null });

  const {
    posts,
    loading,
    loadPosts,
    likePost,
    savePost,
    followUser,
    reportPost,
    deletePost,
    followingIds,
    userLikes,
    userSaves,
  } = useCommunity();

  useEffect(() => {
    loadPosts(activeTab, searchQuery);
    loadUserPlan();
    loadUserProfile();

    // Subscribe to realtime updates for community posts
    const channel = supabase
      .channel("community_posts_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_posts",
        },
        () => {
          loadPosts(activeTab, searchQuery);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const loadUserPlan = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserPlan(data.plan_type || "free");
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserProfile({ avatar_url: data.avatar_url });
    }
  };

  const handleSearch = () => {
    loadPosts(activeTab, searchQuery);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    loadPosts(tab, searchQuery);
  };

  const topicFilters = [
    { id: "corpo", name: "#corpo", icon: "💖", tag: "corpo" },
    { id: "mente", name: "#mente", icon: "🧠", tag: "mente" },
    { id: "relacoes", name: "#relações", icon: "🤝", tag: "relações" },
    { id: "carreira", name: "#carreira", icon: "💼", tag: "carreira" },
  ];

  const handleTopicFilter = (tag: string | null) => {
    setSelectedTopic(selectedTopic === tag ? null : tag);
  };

  const handleNewPostClick = () => {
    setNewPostDrawerOpen(true);
  };

  const handlePostCreated = () => {
    loadPosts(activeTab, searchQuery);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchQuery
      ? post.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTopic = selectedTopic
      ? post.topic?.toLowerCase() === selectedTopic.toLowerCase()
      : true;
    return matchesSearch && matchesTopic;
  });

  return (
    <DashboardLayout title="Comunidade" hideChat>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CENTER FEED */}
        <main className="lg:col-span-2 space-y-6">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <Button variant="outline" className="bg-background flex-shrink-0" onClick={() => navigate("/dashboard/profile")}>
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </Button>
            <Button variant="outline" className="bg-background flex-shrink-0" onClick={() => navigate("/community/groups")}>
              <Users className="w-4 h-4 mr-2" />
              Grupos
            </Button>
            <Button variant="outline" className="bg-background flex-shrink-0" onClick={() => navigate("/help")}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Ajuda
            </Button>
          </div>
          <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarImage src={userProfile.avatar_url || user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar na comunidade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <NotificationBell />
              </div>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="w-full grid grid-cols-3 h-10">
                  <TabsTrigger value="popular" className="text-xs sm:text-sm px-1 sm:px-3 py-2 gap-1 whitespace-nowrap">
                    <TrendingUp className="w-3.5 h-3.5 hidden sm:block" />
                    Populares
                  </TabsTrigger>
                  <TabsTrigger value="my-posts" className="text-xs sm:text-sm px-1 sm:px-3 py-2 whitespace-nowrap">
                    Meus posts
                  </TabsTrigger>
                  <TabsTrigger value="following" className="text-xs sm:text-sm px-1 sm:px-3 py-2 whitespace-nowrap">
                    Amigas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

            <div className="space-y-4">
              {loading ? (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    Carregando posts...
                  </div>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    {activeTab === "following"
                      ? "Siga outras usuárias para ver seus posts aqui 🌸"
                      : activeTab === "my-posts"
                      ? "Você ainda não publicou nada. Compartilhe sua história! 💕"
                      : "Nenhum post encontrado. Seja a primeira a compartilhar! ✨"}
                  </div>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={userLikes.has(post.id)}
                    isSaved={userSaves.has(post.id)}
                    isFollowing={followingIds.has(post.user_id)}
                    onLike={() => likePost(post.id)}
                    onSave={() => savePost(post.id)}
                    onFollow={() => followUser(post.user_id)}
                    onReport={(reason) => reportPost(post.id, reason)}
                    onDelete={() => deletePost(post.id)}
                  />
                ))
              )}
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <GroupsList onGroupClick={(id) => navigate(`/community/groups/${id}`)} />
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Hash className="w-5 h-5 text-primary" />Filtrar por Tópico</h3>
              <div className="space-y-2">
                {selectedTopic && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    size="sm"
                    onClick={() => handleTopicFilter(null)}
                  >
                    ✕ Limpar filtro
                  </Button>
                )}
                {topicFilters.map((topic) => (
                  <Button
                    key={topic.id}
                    variant={selectedTopic === topic.tag ? "default" : "outline"}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => handleTopicFilter(topic.tag)}
                  >
                    <span className="mr-2">{topic.icon}</span>{topic.name}
                  </Button>
                ))}
              </div>
            </Card>
            {userPlan === "free" && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Torne-se Premium</h3>
                  <p className="text-sm text-muted-foreground">Crie grupos, posts ilimitados e muito mais</p>
                  <Button onClick={() => setShowPremiumPopup(true)} className="w-full" size="sm">Ver Planos</Button>
                </div>
              </Card>
            )}
          </aside>
        </div>

      <Button onClick={handleNewPostClick} className="fixed bottom-20 right-6 lg:bottom-6 w-14 h-14 rounded-full shadow-lg z-50" size="icon"><Plus className="w-6 h-6" /></Button>
      <NewPostDrawer open={newPostDrawerOpen} onOpenChange={setNewPostDrawerOpen} onPostCreated={handlePostCreated} />
      <PremiumUpgradePopup isOpen={showPremiumPopup} onClose={() => setShowPremiumPopup(false)} />
    </DashboardLayout>
  );
}
