import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmationDialogProps) {
  const { t } = useLanguage();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-center">
            {t("logout.confirmTitle")} 🌸
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            {t("logout.confirmDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="rounded-full border-border/40 hover:bg-muted/50"
          >
            {t("logout.stay")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground"
          >
            {t("logout.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}