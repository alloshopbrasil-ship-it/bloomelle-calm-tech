import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { Language, getLanguageName, useLanguage } from "@/contexts/LanguageContext";

interface LanguageConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pendingLanguage: Language | null;
  onConfirm: () => void;
}

export const LanguageConfirmDialog = ({ 
  isOpen, 
  onClose, 
  pendingLanguage,
  onConfirm 
}: LanguageConfirmDialogProps) => {
  const { t } = useLanguage();

  if (!pendingLanguage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {t("language.confirmTitle")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t("language.confirmMessage")} <strong>{getLanguageName(pendingLanguage)}</strong>?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              {t("language.confirmDesc")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            {t("language.cancel")}
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1"
          >
            {t("language.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
