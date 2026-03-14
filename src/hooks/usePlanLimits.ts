import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PlanLimits {
  maxActiveGoals: number;
  maxJournalEntriesPerMonth: number;
  maxPublicGroups: number;
  maxDailyPosts: number;
  maxDailyBloomiaMessages: number;
  maxDailyAffirmations: number;
  canCreateGroups: boolean;
  canAccessPrivateGroups: boolean;
  canUseAiJournalAnalysis: boolean;
  canUsePersonalizedAffirmations: boolean;
  canAccessChallenges: boolean;
  canAccessStats: boolean;
  canAccessExclusiveContent: boolean;
}

const FREE_PLAN_LIMITS: PlanLimits = {
  maxActiveGoals: 3,
  maxJournalEntriesPerMonth: 5,
  maxPublicGroups: 2,
  maxDailyPosts: 5,
  maxDailyBloomiaMessages: 5,
  maxDailyAffirmations: 3,
  canCreateGroups: false,
  canAccessPrivateGroups: false,
  canUseAiJournalAnalysis: false,
  canUsePersonalizedAffirmations: false,
  canAccessChallenges: false,
  canAccessStats: false,
  canAccessExclusiveContent: false,
};

const PREMIUM_PLAN_LIMITS: PlanLimits = {
  maxActiveGoals: Infinity,
  maxJournalEntriesPerMonth: Infinity,
  maxPublicGroups: Infinity,
  maxDailyPosts: Infinity,
  maxDailyBloomiaMessages: Infinity,
  maxDailyAffirmations: Infinity,
  canCreateGroups: true,
  canAccessPrivateGroups: true,
  canUseAiJournalAnalysis: true,
  canUsePersonalizedAffirmations: true,
  canAccessChallenges: true,
  canAccessStats: true,
  canAccessExclusiveContent: true,
};

export function usePlanLimits() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>("free");
  const [currentGoalsCount, setCurrentGoalsCount] = useState(0);
  const [currentMonthJournalCount, setCurrentMonthJournalCount] = useState(0);
  const [currentGroupsCount, setCurrentGroupsCount] = useState(0);
  const [currentDailyPostsCount, setCurrentDailyPostsCount] = useState(0);
  const [currentDailyBloomiaMessages, setCurrentDailyBloomiaMessages] = useState(0);
  const [currentDailyAffirmationsViewed, setCurrentDailyAffirmationsViewed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayISO = startOfDay.toISOString();

      // Load user plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserPlan(profile.plan_type || "free");
      }

      // Load active goals count
      const { count: goalsCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_completed", false);

      setCurrentGoalsCount(goalsCount || 0);

      // Load journal entries for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: journalCount } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      setCurrentMonthJournalCount(journalCount || 0);

      // Load groups the user joined
      const { count: groupsCount } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setCurrentGroupsCount(groupsCount || 0);

      // Load daily posts count
      const { count: dailyPostsCount } = await supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfDayISO);

      setCurrentDailyPostsCount(dailyPostsCount || 0);

      // Load daily Bloomia messages count (only user messages)
      const { count: bloomiaCount } = await supabase
        .from("bloomia_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", startOfDayISO);

      setCurrentDailyBloomiaMessages(bloomiaCount || 0);

      // Load daily affirmation views from localStorage
      const savedDate = localStorage.getItem("affirmationViewDate");
      const today = new Date().toDateString();
      if (savedDate === today) {
        const count = parseInt(localStorage.getItem("affirmationViewCount") || "0");
        setCurrentDailyAffirmationsViewed(count);
      } else {
        setCurrentDailyAffirmationsViewed(0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementAffirmationView = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("affirmationViewDate");
    let count = 0;
    if (savedDate === today) {
      count = parseInt(localStorage.getItem("affirmationViewCount") || "0");
    }
    count++;
    localStorage.setItem("affirmationViewDate", today);
    localStorage.setItem("affirmationViewCount", count.toString());
    setCurrentDailyAffirmationsViewed(count);
  };

  const limits = userPlan === "premium" ? PREMIUM_PLAN_LIMITS : FREE_PLAN_LIMITS;
  const isPremium = userPlan === "premium";

  const canAddGoal = isPremium || currentGoalsCount < limits.maxActiveGoals;
  const canAddJournalEntry = isPremium || currentMonthJournalCount < limits.maxJournalEntriesPerMonth;
  const canJoinMoreGroups = isPremium || currentGroupsCount < limits.maxPublicGroups;
  const canCreatePost = isPremium || currentDailyPostsCount < limits.maxDailyPosts;
  const canSendBloomiaMessage = isPremium || currentDailyBloomiaMessages < limits.maxDailyBloomiaMessages;
  const canViewMoreAffirmations = isPremium || currentDailyAffirmationsViewed < limits.maxDailyAffirmations;
  const remainingDailyPosts = Math.max(0, limits.maxDailyPosts - currentDailyPostsCount);
  const remainingBloomiaMessages = Math.max(0, limits.maxDailyBloomiaMessages - currentDailyBloomiaMessages);
  const remainingAffirmations = Math.max(0, limits.maxDailyAffirmations - currentDailyAffirmationsViewed);

  return {
    userPlan,
    isPremium,
    limits,
    currentGoalsCount,
    currentMonthJournalCount,
    currentGroupsCount,
    currentDailyPostsCount,
    currentDailyBloomiaMessages,
    currentDailyAffirmationsViewed,
    canAddGoal,
    canAddJournalEntry,
    canJoinMoreGroups,
    canCreatePost,
    canSendBloomiaMessage,
    canViewMoreAffirmations,
    remainingDailyPosts,
    remainingBloomiaMessages,
    remainingAffirmations,
    incrementAffirmationView,
    loading,
    refresh: loadUserData,
  };
}
