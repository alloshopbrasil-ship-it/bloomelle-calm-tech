import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users, Lock, Plus, Crown, Settings, LogOut, TrendingUp, ArrowLeft, Home, User, HelpCircle } from "lucide-react";
import { CreateGroupDrawer } from "@/components/CreateGroupDrawer";
import DashboardLayout from "@/components/DashboardLayout";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  member_count: number;
  created_by: string;
  created_at: string;
}

export default function MyGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    // Load user plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserPlan(profile.plan_type || "free");
    }

    // Load user's groups (as member)
    const { data: memberData } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (memberData && memberData.length > 0) {
      const groupIds = memberData.map((m) => m.group_id);
      const { data: groups } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      setMyGroups(groups || []);
    }

    // Load popular groups
    const { data: popular } = await supabase
      .from("groups")
      .select("*")
      .eq("is_private", false)
      .order("member_count", { ascending: false })
      .limit(10);

    setPopularGroups(popular || []);

    setLoading(false);
  };

  const handleCreateClick = () => {
    if (userPlan === "premium") {
      setCreateDrawerOpen(true);
    } else {
      setShowPremiumPopup(true);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (error) throw error;

      // Update member count
      const group = popularGroups.find((g) => g.id === groupId);
      if (group) {
        await supabase
          .from("groups")
          .update({ member_count: (group.member_count || 0) + 1 })
          .eq("id", groupId);
      }

      toast({
        title: "Você entrou no grupo! 🌸",
        description: "Bem-vinda a este espaço de acolhimento.",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update member count
      const group = myGroups.find((g) => g.id === groupId);
      if (group) {
        await supabase
          .from("groups")
          .update({ member_count: Math.max(0, (group.member_count || 1) - 1) })
          .eq("id", groupId);
      }

      toast({
        title: "Você saiu do grupo",
        description: "Esperamos te ver novamente 💗",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao sair do grupo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isInGroup = (groupId: string) => {
    return myGroups.some((g) => g.id === groupId);
  };

  if (loading) {
    return (
      <DashboardLayout title="Grupos" hideChat>
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grupos" hideChat>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/community")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Grupos</h2>
                <p className="text-muted-foreground">
                  Espaços de acolhimento e conexão entre mulheres
                </p>
              </div>
              <Button onClick={handleCreateClick}>
                {userPlan === "premium" ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Grupo
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Criar Grupo (Premium)
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="my-groups">
              <TabsList className="mb-6">
                <TabsTrigger value="my-groups">
                  <Users className="w-4 h-4 mr-2" />
                  Meus Grupos ({myGroups.length})
                </TabsTrigger>
                <TabsTrigger value="discover">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Descobrir
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-groups">
                {myGroups.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">Você ainda não está em nenhum grupo</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore grupos e encontre seu espaço de acolhimento 💗
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myGroups.map((group) => (
                      <Card key={group.id} className="rounded-xl hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-14 h-14">
                              <AvatarImage src={group.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {group.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{group.name}</h4>
                                {group.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {group.description || "Espaço de acolhimento"}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  {group.member_count} membras
                                </Badge>
                                {group.created_by === user?.id && (
                                  <Badge className="bg-primary/10 text-primary text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Criadora
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => navigate(`/dashboard/groups/${group.id}`)}
                            >
                              Acessar
                            </Button>
                            {group.created_by !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => leaveGroup(group.id)}
                              >
                                <LogOut className="w-4 h-4" />
                              </Button>
                            )}
                            {group.created_by === user?.id && (
                              <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="discover">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularGroups.map((group) => (
                    <Card key={group.id} className="rounded-xl hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={group.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {group.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{group.name}</h4>
                              {group.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {group.description || "Espaço de acolhimento"}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {group.member_count} membras
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          {isInGroup(group.id) ? (
                            <Button variant="secondary" size="sm" className="w-full" disabled>
                              Você já é membra
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => joinGroup(group.id)}
                            >
                              Entrar no grupo
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
      </div>

      <CreateGroupDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onGroupCreated={loadData}
      />

      <PremiumUpgradePopup isOpen={showPremiumPopup} onClose={() => setShowPremiumPopup(false)} />
    </DashboardLayout>
  );
}