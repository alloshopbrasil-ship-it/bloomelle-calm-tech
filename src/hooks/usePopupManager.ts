import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTrial } from "@/hooks/useTrial";

// Priority order (lower = higher priority)
export enum PopupPriority {
  TRIAL_EXPIRED = 1,
  ONBOARDING = 2,
  WELCOME_TRIAL = 3,
  TOOL_WELCOME = 4,
  COMMUNITY = 5,
  PREMIUM_UPGRADE = 6,
  WELCOME_BACK = 7,
  ORIGIN = 8,
  INSTRUCTIONS = 9,
}

export type PopupType = 
  | "origin"
  | "onboarding"
  | "instructions"
  | "welcome_trial"
  | "trial_expired"
  | "premium_upgrade"
  | "welcome_back"
  | "community"
  | `tool_${string}`;

interface PopupState {
  popup_type: string;
  seen_at: string;
  times_shown: number;
  last_shown_at: string;
  metadata: Record<string, unknown>;
}

interface PopupConfig {
  type: PopupType;
  priority: PopupPriority;
  maxShowsPerCycle?: number;
  cooldownDays?: number;
  onlyOnce?: boolean;
  condition?: () => boolean;
}

interface PopupManagerReturn {
  activePopup: PopupType | null;
  isLoading: boolean;
  isPremium: boolean;
  markPopupSeen: (type: PopupType, metadata?: Record<string, unknown>) => Promise<void>;
  canShowPopup: (type: PopupType) => boolean;
  getPopupState: (type: PopupType) => PopupState | undefined;
  showPopup: (type: PopupType) => void;
  hidePopup: () => void;
  popupStates: Map<string, PopupState>;
  sessionPopupShown: boolean;
}

const SESSION_KEY = "bloomelle_popup_session";
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function usePopupManager(): PopupManagerReturn {
  const { user } = useAuth();
  const { isOnTrial, isTrialExpired, daysRemaining } = useTrial();
  
  const [popupStates, setPopupStates] = useState<Map<string, PopupState>>(new Map());
  const [activePopup, setActivePopup] = useState<PopupType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [sessionPopupShown, setSessionPopupShown] = useState(false);

  // Check session storage for popup shown this session
  useEffect(() => {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (sessionData) {
      setSessionPopupShown(true);
    }
  }, []);

  // Load user profile and popup states
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.plan_type === "premium" && !isOnTrial) {
          setIsPremium(true);
        }

        // Load popup states
        const { data: states } = await supabase
          .from("popup_states")
          .select("*")
          .eq("user_id", user.id);

        if (states) {
          const stateMap = new Map<string, PopupState>();
          states.forEach((state) => {
            stateMap.set(state.popup_type, {
              popup_type: state.popup_type,
              seen_at: state.seen_at,
              times_shown: state.times_shown,
              last_shown_at: state.last_shown_at,
              metadata: (state.metadata as Record<string, unknown>) || {},
            });
          });
          setPopupStates(stateMap);
        }
      } catch (error) {
        console.error("Error loading popup states:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, isOnTrial]);

  // Mark a popup as seen in database
  const markPopupSeen = useCallback(async (type: PopupType, metadata?: Record<string, unknown>) => {
    if (!user) return;

    const existingState = popupStates.get(type);
    const now = new Date().toISOString();

    try {
      if (existingState) {
        // Update existing record
        await supabase
          .from("popup_states")
          .update({
            times_shown: existingState.times_shown + 1,
            last_shown_at: now,
            metadata: (metadata || existingState.metadata) as Record<string, string | number | boolean | null>,
          })
          .eq("user_id", user.id)
          .eq("popup_type", type);

        setPopupStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(type, {
            ...existingState,
            times_shown: existingState.times_shown + 1,
            last_shown_at: now,
            metadata: metadata || existingState.metadata,
          });
          return newMap;
        });
      } else {
        // Create new record
        const insertData = {
          user_id: user.id,
          popup_type: type,
          seen_at: now,
          times_shown: 1,
          last_shown_at: now,
          metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
        };
        
        await supabase
          .from("popup_states")
          .insert(insertData);

        setPopupStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(type, {
            popup_type: type,
            seen_at: now,
            times_shown: 1,
            last_shown_at: now,
            metadata: metadata || {},
          });
          return newMap;
        });
      }

      // Mark session as having shown a popup
      sessionStorage.setItem(SESSION_KEY, "true");
      setSessionPopupShown(true);
    } catch (error) {
      console.error("Error marking popup seen:", error);
    }
  }, [user, popupStates]);

  // Check if a popup can be shown based on rules
  const canShowPopup = useCallback((type: PopupType): boolean => {
    // Rule 1: Premium users don't see any popups (except tool welcome)
    if (isPremium && !type.startsWith("tool_")) {
      return false;
    }

    // Rule 2: Only one popup per session
    if (sessionPopupShown && activePopup !== type) {
      return false;
    }

    const state = popupStates.get(type);

    // Special rules per popup type
    switch (type) {
      case "origin":
        // Only once per device (check localStorage too for backwards compatibility)
        return !state && !localStorage.getItem("hasSeenOrigin");

      case "onboarding":
        // Only once per account
        return !state && !localStorage.getItem("onboardingComplete");

      case "instructions":
        // Only once per account
        return !state && !localStorage.getItem("hasSeenInstructions");

      case "welcome_trial":
        // Only on first day of trial
        return !state && isOnTrial && daysRemaining === 7;

      case "trial_expired":
        // Max 3 times, once per day
        if (!isTrialExpired) return false;
        if (!state) return true;
        if (state.times_shown >= 3) return false;
        const lastShown = new Date(state.last_shown_at);
        const daysSinceLastShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastShown >= 1;

      case "premium_upgrade":
        // Max 5 times per cycle, once per session
        if (!state) return true;
        if (state.times_shown >= 5) {
          // Check if cycle should reset (engagement-based logic could go here)
          return false;
        }
        return true;

      case "community":
        // Once per account, or after 14 days if never interacted
        if (!state) return true;
        const lastPrompt = new Date(state.last_shown_at);
        const hasCommunityInteraction = state.metadata?.hasInteracted === true;
        if (!hasCommunityInteraction && Date.now() - lastPrompt.getTime() > FOURTEEN_DAYS_MS) {
          return true;
        }
        return false;

      case "welcome_back":
        // After 30 days of inactivity
        const lastLogin = localStorage.getItem("lastLogin");
        if (!lastLogin) return false;
        const lastDate = new Date(lastLogin);
        const daysDiff = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 30;

      default:
        // Tool welcome popups - only once
        if (type.startsWith("tool_")) {
          return !state;
        }
        return false;
    }
  }, [isPremium, sessionPopupShown, activePopup, popupStates, isOnTrial, daysRemaining, isTrialExpired]);

  // Get popup state
  const getPopupState = useCallback((type: PopupType): PopupState | undefined => {
    return popupStates.get(type);
  }, [popupStates]);

  // Show a popup
  const showPopup = useCallback((type: PopupType) => {
    if (!sessionPopupShown || activePopup === type) {
      setActivePopup(type);
    }
  }, [sessionPopupShown, activePopup]);

  // Hide current popup
  const hidePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  // Determine highest priority popup to show
  useEffect(() => {
    if (isLoading || sessionPopupShown || !user) return;

    const popupsToCheck: { type: PopupType; priority: PopupPriority }[] = [
      { type: "trial_expired", priority: PopupPriority.TRIAL_EXPIRED },
      { type: "onboarding", priority: PopupPriority.ONBOARDING },
      { type: "welcome_trial", priority: PopupPriority.WELCOME_TRIAL },
      { type: "community", priority: PopupPriority.COMMUNITY },
      { type: "premium_upgrade", priority: PopupPriority.PREMIUM_UPGRADE },
      { type: "welcome_back", priority: PopupPriority.WELCOME_BACK },
      { type: "origin", priority: PopupPriority.ORIGIN },
      { type: "instructions", priority: PopupPriority.INSTRUCTIONS },
    ];

    // Sort by priority
    popupsToCheck.sort((a, b) => a.priority - b.priority);

    // Find first eligible popup
    for (const { type } of popupsToCheck) {
      if (canShowPopup(type)) {
        setActivePopup(type);
        break;
      }
    }
  }, [isLoading, sessionPopupShown, user, canShowPopup]);

  return {
    activePopup,
    isLoading,
    isPremium,
    markPopupSeen,
    canShowPopup,
    getPopupState,
    showPopup,
    hidePopup,
    popupStates,
    sessionPopupShown,
  };
}

// Hook for tool-specific welcome popups
export function useToolWelcome(toolName: string) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!user || isChecked) return;

    const checkToolWelcome = async () => {
      try {
        const { data } = await supabase
          .from("popup_states")
          .select("id")
          .eq("user_id", user.id)
          .eq("popup_type", `tool_${toolName}`)
          .maybeSingle();

        if (!data) {
          // Check session - only one popup per session
          const sessionData = sessionStorage.getItem(SESSION_KEY);
          if (!sessionData) {
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error checking tool welcome:", error);
      } finally {
        setIsChecked(true);
      }
    };

    checkToolWelcome();
  }, [user, toolName, isChecked]);

  const closeToolWelcome = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("popup_states")
        .insert({
          user_id: user.id,
          popup_type: `tool_${toolName}`,
          seen_at: new Date().toISOString(),
          times_shown: 1,
          last_shown_at: new Date().toISOString(),
          metadata: {},
        });

      sessionStorage.setItem(SESSION_KEY, "true");
    } catch (error) {
      console.error("Error closing tool welcome:", error);
    }

    setIsOpen(false);
  }, [user, toolName]);

  return { isOpen, closeToolWelcome };
}
