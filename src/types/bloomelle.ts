export interface DailyEntry {
  id: string;
  date: string;
  completed: boolean;
  imageUrl?: string;
  note?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  weeklyStatus: boolean[];
}
