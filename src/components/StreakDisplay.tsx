import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { Skeleton } from "@/components/ui/skeleton";

interface StreakDisplayProps {
  compact?: boolean;
}

export const StreakDisplay = ({ compact = false }: StreakDisplayProps) => {
  const { currentStreak, longestStreak, loading } = useStreak();

  if (loading) {
    return compact ? (
      <Skeleton className="h-8 w-24 rounded-full" />
    ) : (
      <Card className="rounded-2xl border-border/40">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
        <span className="font-semibold text-foreground">{currentStreak}</span>
        <span className="text-sm text-muted-foreground">dias</span>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/40 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-yellow-500/10 animate-fade-in overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${currentStreak > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-muted'}`}>
              <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-white animate-pulse' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
              </h3>
              <p className="text-sm text-muted-foreground">Streak atual 🔥</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-primary">
              <Trophy className="w-4 h-4" />
              <span className="font-semibold">{longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Recorde</p>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="mt-4 flex gap-1">
            {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{
                  opacity: 0.5 + (i / 7) * 0.5,
                }}
              />
            ))}
            {currentStreak < 7 &&
              Array.from({ length: 7 - currentStreak }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 h-2 rounded-full bg-muted"
                />
              ))}
          </div>
        )}

        {currentStreak === 0 && (
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Complete atividades diárias para iniciar seu streak! 🌱
          </p>
        )}
      </CardContent>
    </Card>
  );
};
