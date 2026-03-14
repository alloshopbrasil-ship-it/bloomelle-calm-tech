import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export const useStreak = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStreakData({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      // Create new streak record
      const { error } = await supabase.from("user_streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });

      if (!error) {
        setStreakData({
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
        });
      }
      return;
    }

    // Already updated today
    if (existing.last_activity_date === today) {
      return;
    }

    const lastDate = existing.last_activity_date
      ? new Date(existing.last_activity_date)
      : null;
    const todayDate = new Date(today);

    let newStreak = 1;

    if (lastDate) {
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = existing.current_streak + 1;
      }
      // If diffDays > 1, streak resets to 1
    }

    const newLongest = Math.max(existing.longest_streak, newStreak);

    const { error } = await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
      })
      .eq("user_id", user.id);

    if (!error) {
      setStreakData({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: today,
      });
    }
  }, [user]);

  const checkAndUpdateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    // Check if user has any activity today (tasks, journal, mood, etc.)
    const { data: dailyCompletion } = await supabase
      .from("daily_completions")
      .select("*")
      .eq("user_id", user.id)
      .eq("completion_date", today)
      .maybeSingle();

    if (dailyCompletion) {
      await updateStreak();
    }
  }, [user, updateStreak]);

  return {
    ...streakData,
    loading,
    updateStreak,
    checkAndUpdateStreak,
    reload: loadStreak,
  };
};
