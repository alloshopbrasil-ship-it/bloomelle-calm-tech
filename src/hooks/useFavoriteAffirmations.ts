import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFavoriteAffirmations = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("favorite_affirmations")
      .select("affirmation_id")
      .eq("user_id", user.id);

    if (data && !error) {
      setFavorites(data.map((f) => f.affirmation_id));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (affirmationId: number) => {
      if (!user) return false;

      const isFavorite = favorites.includes(affirmationId);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_affirmations")
          .delete()
          .eq("user_id", user.id)
          .eq("affirmation_id", affirmationId);

        if (!error) {
          setFavorites((prev) => prev.filter((id) => id !== affirmationId));
          return true;
        }
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorite_affirmations").insert({
          user_id: user.id,
          affirmation_id: affirmationId,
        });

        if (!error) {
          setFavorites((prev) => [...prev, affirmationId]);
          return true;
        }
      }

      return false;
    },
    [user, favorites]
  );

  const isFavorite = useCallback(
    (affirmationId: number) => favorites.includes(affirmationId),
    [favorites]
  );

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    reload: loadFavorites,
  };
};
