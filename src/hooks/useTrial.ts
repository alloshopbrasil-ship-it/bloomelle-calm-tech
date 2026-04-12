import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TrialInfo {
  isOnTrial: boolean;
  trialEndsAt: Date | null;
  daysRemaining: number;
  hasUsedTrial: boolean;
  isTrialExpired: boolean;
}

export function useTrial() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isOnTrial: false,
    trialEndsAt: null,
    daysRemaining: 0,
    hasUsedTrial: false,
    isTrialExpired: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrialInfo();
    }
  }, [user]);

  const loadTrialInfo = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type, trial_started_at, trial_ends_at, has_used_trial")
        .eq("id", user.id)
        .single();

      if (profile) {
        const now = new Date();
        const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
        const hasUsedTrial = profile.has_used_trial || false;
        
        let isOnTrial = false;
        let daysRemaining = 0;
        let isTrialExpired = false;

        if (trialEndsAt && hasUsedTrial) {
          if (now < trialEndsAt) {
            // Trial is active
            isOnTrial = true;
            daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          } else {
            // Trial has expired - server-side edge function handles plan reversion
            isTrialExpired = true;
          }
        }

        setTrialInfo({
          isOnTrial,
          trialEndsAt,
          daysRemaining,
          hasUsedTrial,
          isTrialExpired,
        });
      }
    } catch (error) {
      console.error("Error loading trial info:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...trialInfo,
    loading,
    refresh: loadTrialInfo,
  };
}
