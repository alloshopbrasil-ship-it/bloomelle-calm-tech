import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ImagePlus, X, Crown, Smile, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NewPostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const moodOptions = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "😌", label: "Tranquila" },
  { emoji: "🥰", label: "Amada" },
  { emoji: "💪", label: "Forte" },
  { emoji: "🌸", label: "Em paz" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😰", label: "Ansiosa" },
  { emoji: "😤", label: "Frustrada" },
  { emoji: "🤔", label: "Reflexiva" },
  { emoji: "✨", label: "Grata" },
];

const topicOptions = [
  { id: "geral", name: "Geral", icon: "💬" },
  { id: "corpo", name: "#corpo", icon: "💖" },
  { id: "mente", name: "#mente", icon: "🧠" },
  { id: "relações", name: "#relações", icon: "🤝" },
  { id: "carreira", name: "#carreira", icon: "💼" },
];

export const NewPostDrawer = ({ open, onOpenChange, onPostCreated }: NewPostDrawerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCreatePost, remainingDailyPosts, isPremium, refresh } = usePlanLimits();
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("geral");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadProfileImage();
    }
  }, [user]);

  const loadProfileImage = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    
    if (data?.avatar_url) {
      setProfileImage(data.avatar_url);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishPost = async () => {
    if (!newPost.trim() || !user) {
      toast({
        title: "Escreva algo primeiro 💫",
        description: "Compartilhe seus sentimentos com a comunidade.",
        variant: "destructive",
      });
      return;
    }

    // Check daily post limit for free users
    if (!canCreatePost) {
      setShowUpgradePopup(true);
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, selectedImage, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          content: newPost,
          image_url: imageUrl,
          topic: selectedTopic,
          mood_emoji: selectedMood,
        });

      if (error) throw error;

      toast({
        title: "Post publicado! 🌸",
        description: "Sua voz foi ouvida. Obrigada por compartilhar.",
      });

      setNewPost("");
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedMood(null);
      setSelectedTopic("geral");
      onOpenChange(false);
      refresh(); // Refresh the limits count
      onPostCreated?.();
    } catch (error: any) {
      toast({
        title: "Erro ao publicar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] rounded-t-[2rem]">
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
              <DrawerTitle className="text-lg font-semibold">Nova postagem</DrawerTitle>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Daily post limit indicator for free users */}
            {!isPremium && (
              <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Posts restantes hoje:
                  </span>
                  <span className={`text-sm font-medium ${remainingDailyPosts === 0 ? 'text-destructive' : 'text-primary'}`}>
                    {remainingDailyPosts}/5
                  </span>
                </div>
                {remainingDailyPosts <= 2 && (
                  <button
                    onClick={() => setShowUpgradePopup(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Crown className="w-3 h-3" />
                    Posts ilimitados
                  </button>
                )}
              </div>
            )}

            {/* Mood selector */}
            {selectedMood && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">{selectedMood}</span>
                <span className="text-sm text-muted-foreground">
                  {moodOptions.find(m => m.emoji === selectedMood)?.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedMood(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex gap-4 mb-4 mt-2">
              <Avatar className="h-12 w-12 flex-shrink-0 mt-1">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Em que você está pensando? 💭"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="resize-none border-none focus-visible:ring-0 text-base min-h-[200px] p-4 pt-3"
              />
            </div>

            {imagePreview && (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded-2xl"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 rounded-full h-8 w-8"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 p-4 flex items-center justify-between bg-background/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full h-12 w-12"
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
              </Button>
              
              {/* Mood Emoji Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-12 w-12"
                  >
                    {selectedMood ? (
                      <span className="text-2xl">{selectedMood}</span>
                    ) : (
                      <Smile className="w-6 h-6 text-muted-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">Como você está se sentindo?</p>
                  <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.emoji}
                        onClick={() => setSelectedMood(mood.emoji)}
                        className={`p-2 rounded-lg text-2xl hover:bg-muted/50 transition-colors ${
                          selectedMood === mood.emoji ? 'bg-primary/10 ring-2 ring-primary' : ''
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Topic Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-10 px-3 gap-1"
                  >
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {topicOptions.find((t) => t.id === selectedTopic)?.name || "Tópico"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">Escolha um tópico</p>
                  <div className="flex flex-col gap-1">
                    {topicOptions.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                          selectedTopic === topic.id ? "bg-primary/10 ring-1 ring-primary" : ""
                        }`}
                      >
                        <span>{topic.icon}</span>
                        <span className="text-sm">{topic.name}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Button
              onClick={publishPost}
              disabled={uploading || !newPost.trim()}
              className="rounded-full px-8 h-12 bg-gradient-primary text-white hover:opacity-90"
            >
              {uploading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <PremiumUpgradePopup 
        isOpen={showUpgradePopup} 
        onClose={() => setShowUpgradePopup(false)} 
      />
    </>
  );
};