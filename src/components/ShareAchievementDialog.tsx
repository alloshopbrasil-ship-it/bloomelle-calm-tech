import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: {
    title: string;
    description: string;
    emoji?: string;
  };
}

export const ShareAchievementDialog = ({ open, onOpenChange, achievement }: ShareAchievementDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `🌸 Conquista desbloqueada na Bloomelle!\n\n${achievement.emoji || "✨"} ${achievement.title}\n${achievement.description}\n\nCultive sua autoestima em bloomelle.com`;
  
  const shareUrl = window.location.origin;

  const shareOptions = [
    {
      name: "Twitter/X",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      }
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      onClick: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copiado! 📋",
        description: "Texto copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${achievement.emoji || "✨"} ${achievement.title}`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Compartilhar conquista</DialogTitle>
          </div>
          <DialogDescription>
            Celebre seu progresso e inspire outras mulheres!
          </DialogDescription>
        </DialogHeader>

        {/* Achievement Preview */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-6 text-center my-4">
          <div className="text-4xl mb-3">{achievement.emoji || "✨"}</div>
          <h3 className="text-lg font-medium mb-1">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          {/* Native Share (Mobile) */}
          {typeof navigator !== "undefined" && navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full rounded-full bg-gradient-to-r from-primary to-secondary text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          )}

          {/* Social Buttons */}
          <div className="flex gap-2 justify-center">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                onClick={option.onClick}
                className={`rounded-full ${option.color} text-white`}
                size="icon"
                title={option.name}
              >
                <option.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          {/* Copy Button */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full rounded-full"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar texto
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
