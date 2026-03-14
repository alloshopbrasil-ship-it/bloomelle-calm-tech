import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, Heart, Info } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  last_message_preview: string | null;
  otherUser?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  unreadCount?: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            selectedConversation &&
            (newMsg.sender_id === getOtherUserId(selectedConversation) ||
              newMsg.receiver_id === getOtherUserId(selectedConversation))
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  const getOtherUserId = (conv: Conversation) => {
    return conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Get other user profiles
        const otherUserIds = data.map((c) =>
          c.participant_1 === user.id ? c.participant_2 : c.participant_1
        );

        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("id, name, avatar_url")
          .in("id", otherUserIds);

        // Get unread counts
        const { data: unreadData } = await supabase
          .from("direct_messages")
          .select("sender_id")
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        const unreadCounts = unreadData?.reduce((acc, msg) => {
          acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const conversationsWithUsers = data.map((conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          return {
            ...conv,
            otherUser: profiles?.find((p) => p.id === otherUserId) || { id: otherUserId, name: null, avatar_url: null },
            unreadCount: unreadCounts?.[otherUserId] || 0,
          };
        });

        setConversations(conversationsWithUsers);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    if (!user) return;

    const otherUserId = getOtherUserId(conversation);

    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const markAsRead = async (conversation: Conversation) => {
    if (!user) return;

    const otherUserId = getOtherUserId(conversation);

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", user.id);
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const otherUserId = getOtherUserId(selectedConversation);

    try {
      const { error } = await supabase.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessage,
        conversation_id: selectedConversation.id,
      });

      if (error) throw error;

      // Update conversation
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: newMessage.substring(0, 100),
        })
        .eq("id", selectedConversation.id);

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Não foi possível enviar agora",
        description: "Sua voz importa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
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
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader title="Mensagens" />

          <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <Card className={`rounded-2xl ${selectedConversation ? "hidden md:block" : ""}`}>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Conversas
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Heart className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ainda está silencioso por aqui. Conecte-se com outras mulheres 💗
                        </p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left ${
                            selectedConversation?.id === conv.id ? "bg-muted/50" : ""
                          }`}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conv.otherUser?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {conv.otherUser?.name || "Usuária"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {getTimestamp(conv.last_message_at)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message_preview || "Nova conversa"}
                            </p>
                          </div>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Messages Area */}
              <Card className={`md:col-span-2 rounded-2xl ${!selectedConversation ? "hidden md:block" : ""}`}>
                {selectedConversation ? (
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedConversation.otherUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {selectedConversation.otherUser?.name || "Usuária"}
                        </p>
                      </div>
                    </div>

                    {/* Safety Notice */}
                    <div className="px-4 py-2 bg-primary/5 text-center">
                      <p className="text-xs text-primary flex items-center justify-center gap-1">
                        <Info className="w-3 h-3" />
                        Este é um espaço seguro e respeitoso 💗
                      </p>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                msg.sender_id === user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {getTimestamp(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escreva sua mensagem..."
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">Suas mensagens</h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione uma conversa para começar
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
