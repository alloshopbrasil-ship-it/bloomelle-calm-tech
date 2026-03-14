import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const DashboardHeaderProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("");
  const { t } = useLanguage();

  useEffect(() => {
    const loadProfileImage = async () => {
      // First try localStorage for instant display
      const savedImage = localStorage.getItem("profileImage");
      if (savedImage) {
        setProfileImage(savedImage);
      }
      // Then fetch from DB for accuracy
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        if (data?.avatar_url) {
          setProfileImage(data.avatar_url);
          localStorage.setItem("profileImage", data.avatar_url);
        }
      }
    };

    loadProfileImage();

    const handleProfileImageUpdate = () => {
      const savedImage = localStorage.getItem("profileImage");
      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    window.addEventListener("profileImageUpdate", handleProfileImageUpdate);
    return () => {
      window.removeEventListener("profileImageUpdate", handleProfileImageUpdate);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 md:h-10 md:w-10 rounded-full p-0 hover:bg-muted/50">
          <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-border/40">
            <AvatarImage src={profileImage} alt="Profile" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 bg-popover" align="end">
        <PopoverHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-border/40">
              <AvatarImage src={profileImage} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <PopoverTitle className="truncate">
                {user?.email?.split('@')[0] || 'Usuária'}
              </PopoverTitle>
              <PopoverDescription className="text-xs truncate">
                {user?.email || 'user@bloomelle.com'}
              </PopoverDescription>
            </div>
          </div>
        </PopoverHeader>

        <PopoverBody className="space-y-1 px-2 py-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-muted/50" 
            size="sm"
            onClick={() => navigate("/dashboard/settings")}
          >
            <User className="mr-2 h-4 w-4" />
            {t("profile.myProfile")}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-muted/50" 
            size="sm"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("profile.settings")}
          </Button>
        </PopoverBody>

        <PopoverFooter>
          <Button 
            variant="outline" 
            className="w-full bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" 
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("profile.logout")}
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
