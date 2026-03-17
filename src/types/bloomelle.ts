export interface DailyEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  imageUrl?: string;
  note?: string;
  completed: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  weeklyStatus: boolean[]; // [sun, mon, tue, wed, thu, fri, sat]
}