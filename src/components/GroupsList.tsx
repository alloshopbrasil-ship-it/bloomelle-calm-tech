import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Plus, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateGroupDrawer } from "./CreateGroupDrawer";
import { PremiumUpgradePopup } from "./PremiumUpgradePopup";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  member_count: number;
  created_at: string;
}

interface GroupsListProps {
  onGroupClick?: (groupId: string) => void;
}

export function GroupsList({ onGroupClick }: GroupsListProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  useEffect(() => {
    loadGroups();
    loadUserPlan();
  }, []);

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

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("member_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (userPlan === "premium") {
      setCreateDrawerOpen(true);
    } else {
      setShowPremiumPopup(true);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Grupos Populares
          </h3>
        </div>

        <div className="space-y-3">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onGroupClick?.(group.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={group.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {group.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{group.name}</p>
                  {group.is_private && (
                    <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {group.member_count}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          asChild
        >
          <Link to="/community/groups">Ver Todos os Grupos</Link>
        </Button>

        {/* Create Group Button */}
        {userPlan === "premium" ? (
          <Button
            onClick={handleCreateClick}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Grupo
          </Button>
        ) : (
          <Button
            onClick={handleCreateClick}
            variant="outline"
            className="w-full border-primary/20 text-muted-foreground hover:bg-primary/5"
          >
            <Crown className="w-4 h-4 mr-2" />
            Criar Grupo (Premium)
          </Button>
        )}
      </Card>

      <CreateGroupDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onGroupCreated={loadGroups}
      />

      <PremiumUpgradePopup
        isOpen={showPremiumPopup}
        onClose={() => setShowPremiumPopup(false)}
      />
    </>
  );
}
