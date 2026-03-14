import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "EXCLUIR") {
      toast({
        title: "Confirmação incorreta",
        description: 'Por favor, digite "EXCLUIR" para confirmar.',
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // Delete user data from all tables
      await supabase.from('daily_tasks').delete().eq('user_id', user.id);
      await supabase.from('journal_entries').delete().eq('user_id', user.id);
      await supabase.from('goals').delete().eq('user_id', user.id);
      await supabase.from('moods').delete().eq('user_id', user.id);
      await supabase.from('daily_completions').delete().eq('user_id', user.id);
      await supabase.from('post_comments').delete().eq('user_id', user.id);
      await supabase.from('post_likes').delete().eq('user_id', user.id);
      await supabase.from('post_saves').delete().eq('user_id', user.id);
      await supabase.from('community_posts').delete().eq('user_id', user.id);
      await supabase.from('follows').delete().eq('follower_id', user.id);
      await supabase.from('follows').delete().eq('following_id', user.id);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      await supabase.from('favorite_affirmations').delete().eq('user_id', user.id);
      await supabase.from('user_streaks').delete().eq('user_id', user.id);
      await supabase.from('group_members').delete().eq('user_id', user.id);
      await supabase.from('direct_messages').delete().eq('sender_id', user.id);
      await supabase.from('direct_messages').delete().eq('receiver_id', user.id);
      await supabase.from('blocked_users').delete().eq('blocker_id', user.id);
      await supabase.from('blocked_users').delete().eq('blocked_id', user.id);
      await supabase.from('popup_states').delete().eq('user_id', user.id);
      await supabase.from('calendar_events').delete().eq('user_id', user.id);
      await supabase.from('moderation_flags').delete().eq('reporter_id', user.id);
      await supabase.from('bloomia_messages').delete().eq('user_id', user.id);

      // Delete conversations where user is participant
      await supabase.from('conversations').delete().eq('participant_1', user.id);
      await supabase.from('conversations').delete().eq('participant_2', user.id);

      // Delete profile
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out
      await signOut();

      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso. Sentiremos sua falta! 💔",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-destructive/20 bg-gradient-to-br from-card to-destructive/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center flex items-center justify-center gap-2 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            Excluir Conta
          </DialogTitle>
          <DialogDescription className="text-center">
            Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-sm text-destructive font-medium mb-2">
              ⚠️ O que será excluído:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seu perfil e configurações</li>
              <li>• Todas as suas tarefas e metas</li>
              <li>• Seu diário e registros de humor</li>
              <li>• Posts, comentários e curtidas</li>
              <li>• Mensagens e conversas</li>
              <li>• Progresso e conquistas</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Digite <span className="font-bold text-destructive">EXCLUIR</span> para confirmar
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="EXCLUIR"
              className="border-destructive/30 focus:border-destructive"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => {
                setConfirmText("");
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full"
              onClick={handleDeleteAccount}
              disabled={loading || confirmText !== "EXCLUIR"}
            >
              {loading ? "Excluindo..." : "Excluir Permanentemente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
