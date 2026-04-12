import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Users, MessageCircle, Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SharePostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postContent: string;
}

interface Group {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string | null;
  participant_avatar: string | null;
}

export function SharePostDrawer({ open, onOpenChange, postId, postContent }: SharePostDrawerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadData();
    }
  }, [open, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load groups the user is a member of
      const { data: memberGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (memberGroups && memberGroups.length > 0) {
        const groupIds = memberGroups.map((m) => m.group_id);
        const { data: groupsData } = await supabase
          .from("groups")
          .select("id, name, avatar_url, member_count")
          .in("id", groupIds);

        if (groupsData) {
          setGroups(groupsData);
        }
      }

      // Load conversations
      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (convData && convData.length > 0) {
        const otherUserIds = convData.map((c) =>
          c.participant_1 === user.id ? c.participant_2 : c.participant_1
        );

        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("id, name, avatar_url")
          .in("id", otherUserIds);

        const conversationsWithProfiles = convData.map((c) => {
          const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
          const profile = profiles?.find((p) => p.id === otherId);
          return {
            id: c.id,
            participant_id: otherId,
            participant_name: profile?.name || null,
            participant_avatar: profile?.avatar_url || null,
          };
        });

        setConversations(conversationsWithProfiles);
      }
    } catch (error) {
      console.error("Error loading share data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string, type: "group" | "conversation") => {
    const key = `${type}:${id}`;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const handleShare = async () => {
    if (!user || selectedItems.size === 0) return;
    setSharing(true);

    try {
      const shareMessage = `📌 Post compartilhado:\n\n"${postContent.slice(0, 200)}${postContent.length > 200 ? "..." : ""}"`;

      for (const item of selectedItems) {
        const [type, id] = item.split(":");

        if (type === "group") {
          // Share to group as a post
          await supabase.from("group_posts").insert({
            group_id: id,
            user_id: user.id,
            content: shareMessage,
          });
        } else if (type === "conversation") {
          const conv = conversations.find((c) => c.id === id);
          if (conv) {
            await supabase.from("direct_messages").insert({
              conversation_id: id,
              sender_id: user.id,
              receiver_id: conv.participant_id,
              content: shareMessage,
            });

            // Update conversation last message
            await supabase
              .from("conversations")
              .update({
                last_message_at: new Date().toISOString(),
                last_message_preview: shareMessage.slice(0, 50),
              })
              .eq("id", id);
          }
        }
      }

      toast({
        title: "Compartilhado! 🎉",
        description: `Post compartilhado com ${selectedItems.size} ${selectedItems.size === 1 ? "destinatário" : "destinatários"}.`,
      });

      setSelectedItems(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing post:", error);
      toast({
        title: "Erro ao compartilhar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((c) =>
    c.participant_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] rounded-t-[2rem]">
        <DrawerHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            <DrawerTitle className="text-lg font-semibold">Compartilhar</DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={selectedItems.size === 0 || sharing}
              className="text-primary font-medium"
            >
              {sharing ? "Enviando..." : `Enviar${selectedItems.size > 0 ? ` (${selectedItems.size})` : ""}`}
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos ou conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="groups" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Grupos
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Mensagens
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[45vh]">
              <TabsContent value="groups" className="mt-0 space-y-2">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : filteredGroups.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {groups.length === 0
                      ? "Você não faz parte de nenhum grupo ainda."
                      : "Nenhum grupo encontrado."}
                  </p>
                ) : (
                  filteredGroups.map((group) => {
                    const isSelected = selectedItems.has(`group:${group.id}`);
                    return (
                      <button
                        key={group.id}
                        onClick={() => toggleSelection(group.id, "group")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                        }`}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={group.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {group.member_count} membros
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-0 space-y-2">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : filteredConversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {conversations.length === 0
                      ? "Você não tem conversas ainda."
                      : "Nenhuma conversa encontrada."}
                  </p>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedItems.has(`conversation:${conv.id}`);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => toggleSelection(conv.id, "conversation")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                        }`}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.participant_avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(conv.participant_name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{conv.participant_name || "Julia"}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}