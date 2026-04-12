import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Image as ImageIcon, Users, Lock } from "lucide-react";

interface CreateGroupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDrawer({
  open,
  onOpenChange,
  onGroupCreated,
}: CreateGroupDrawerProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const createGroup = async () => {
    if (!name.trim()) {
      toast.error("Por favor, dê um nome ao grupo");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setCreating(true);

    try {
      let avatarUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        avatarUrl = publicUrl;
      }

      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          avatar_url: avatarUrl,
          is_private: isPrivate,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      toast.success("Grupo criado com sucesso!");
      
      // Reset form
      setName("");
      setDescription("");
      setIsPrivate(false);
      setSelectedImage(null);
      setImagePreview(null);
      
      onOpenChange(false);
      onGroupCreated?.();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Erro ao criar grupo");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Criar Novo Grupo
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do Grupo *</Label>
            <Input
              id="group-name"
              placeholder="Ex: Autoestima feminina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description">Descrição</Label>
            <Textarea
              id="group-description"
              placeholder="Descreva o propósito do grupo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="private-toggle" className="cursor-pointer">
                  Grupo Privado
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas membros podem ver o conteúdo
                </p>
              </div>
            </div>
            <Switch
              id="private-toggle"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {imagePreview ? "Trocar Imagem" : "Adicionar Imagem"}
          </Button>
          <Button
            onClick={createGroup}
            disabled={creating || !name.trim()}
            className="flex-1"
          >
            {creating ? "Criando..." : "Criar Grupo"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
