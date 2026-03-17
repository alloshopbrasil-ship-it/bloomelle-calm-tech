import React from 'react';
import { Check, Trophy } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weeklyStatus: boolean[];
}

const StreakCard = ({ currentStreak, longestStreak, weeklyStatus }: StreakCardProps) => {
  const days = ['d', 's', 't', 'q', 'q', 's', 's'];

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#F0E6FF] p-2 rounded-full">
              <Check className="w-5 h-5 text-[#E58B8B]" strokeWidth={3} />
            </div>
            <span className="text-3xl font-light text-gray-800">{currentStreak}</span>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">dias seguidos</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <span className="text-xl font-light text-gray-600">{longestStreak}</span>
            <Trophy className="w-4 h-4 text-yellow-400/60" />
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">recorde pessoal</p>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
              ${weeklyStatus[index] 
                ? 'bg-[#E58B8B] text-white shadow-md shadow-pink-100' 
                : 'bg-gray-50 text-gray-300 border border-gray-100'}
            `}>
              {weeklyStatus[index] ? (
                <Check className="w-4 h-4" strokeWidth={3} />
              ) : (
                <span className="text-[10px] font-bold uppercase">{day}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCard;