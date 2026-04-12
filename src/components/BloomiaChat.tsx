import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";

interface BloomiaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bloomia-chat`;

const WELCOME_SUGGESTIONS = [
  "Como posso melhorar minha autoestima? 🌸",
  "Me dê uma afirmação positiva ✨",
  "Sugira uma meta de autocuidado 🌿",
  "Estou precisando de apoio 💕",
];

export const BloomiaChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BloomiaMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && user && !hasLoadedHistory) {
      loadHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bloomia_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data as BloomiaMessage[]);
    }
    setHasLoadedHistory(true);
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("bloomia_messages").delete().eq("user_id", user.id);
    setMessages([]);
    toast({ title: "Conversa limpa 🌸", description: "Começamos do zero!" });
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading || !user) return;

    // Check plan limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();

    if (profile?.plan_type !== "premium") {
      const { count } = await supabase
        .from("bloomia_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", startOfDay.toISOString());

      if ((count || 0) >= 5) {
        setShowUpgrade(true);
        return;
      }
    }

    setInput("");
    const userMsg: BloomiaMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Não autenticada");

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: messageText, context: "chat" }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao conectar com Bloomia");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  {
                    id: assistantId,
                    role: "assistant",
                    content: assistantContent,
                    created_at: new Date().toISOString(),
                  },
                ];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({
        title: "Ops! 🌸",
        description: e.message || "Não foi possível conectar com a Bloomia.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 lg:bottom-8 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
            aria-label="Abrir chat com Bloomia"
          >
            <Sparkles className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 lg:bottom-8 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] bg-card border border-border/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Bloomia 🌸</h3>
                  <p className="text-xs text-muted-foreground">Sua amiga de autoestima</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={clearHistory}
                  title="Limpar conversa"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">Olá! Sou a Bloomia 🌸</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estou aqui para te ouvir e apoiar. Como posso te ajudar?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {WELCOME_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30 bg-card">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreva para a Bloomia..."
                  className="resize-none min-h-[40px] max-h-[100px] rounded-2xl text-sm border-border/40 focus-visible:ring-primary/30"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumUpgradePopup isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
};
