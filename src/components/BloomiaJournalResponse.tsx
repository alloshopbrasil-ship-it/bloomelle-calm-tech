import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bloomia-chat`;

interface BloomiaJournalResponseProps {
  journalContent: string;
  onClose: () => void;
}

export const BloomiaJournalResponse = ({ journalContent, onClose }: BloomiaJournalResponseProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const askBloomia = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    setHasAsked(true);
    let content = "";

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
        body: JSON.stringify({
          message: `A usuária acabou de escrever isto no diário emocional. Responda de forma reflexiva e acolhedora sobre o que ela compartilhou:\n\n"${journalContent.substring(0, 1000)}"`,
          context: "journal",
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Erro ao conectar");

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
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setResponse(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({
        title: "Bloomia não conseguiu responder 🌸",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAsked) {
    return (
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <p className="text-sm text-foreground font-medium">Bloomia 🌸</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Quer que eu leia sua reflexão e te dê um abraço em palavras? 💕
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="rounded-full text-xs" onClick={askBloomia}>
            <Send className="w-3 h-3 mr-1" /> Sim, quero ouvir a Bloomia
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={onClose}>
            Agora não
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <p className="text-sm text-foreground font-medium">Bloomia 🌸</p>
      </div>
      {isLoading && !response ? (
        <div className="flex gap-1 py-2">
          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
