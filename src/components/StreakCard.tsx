import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weeklyStatus: boolean[];
}

const StreakCard = ({ currentStreak, longestStreak, weeklyStatus }: StreakCardProps) => {
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const todayIndex = new Date().getDay();

  return (
    <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Sequência atual</p>
            <div className="flex items-center gap-2">
              <div className="bg-[#E58B8B] p-1 rounded-full">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-3xl font-light text-gray-800">{currentStreak} dias</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Maior sequência</p>
            <p className="text-xl font-light text-gray-600">{longestStreak} dias</p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          {days.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold">{day}</span>
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${index === todayIndex ? 'ring-2 ring-[#E58B8B] ring-offset-2' : ''}
                  ${weeklyStatus[index] 
                    ? 'bg-[#E58B8B] text-white' 
                    : 'bg-gray-100 text-transparent'}
                `}
              >
                {weeklyStatus[index] && <Check className="w-4 h-4" strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCard;