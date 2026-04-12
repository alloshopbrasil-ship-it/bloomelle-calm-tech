import { useEffect, useState } from "react";
import balloonBg from "@/assets/daily-tip-balloon-bg.jpg";

const inspirationalPhrases = [
  "Florescer é um processo 🌸",
  "Você é suficiente hoje 💕",
  "Pequenos passos criam grandes mudanças 🌷",
  "Sinta orgulho de quem está se tornando ✨",
];

export const DailyTipBalloon = () => {
  const [currentPhrase, setCurrentPhrase] = useState("");

  useEffect(() => {
    // Get phrase based on date (changes daily)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const phraseIndex = dayOfYear % inspirationalPhrases.length;
    setCurrentPhrase(inspirationalPhrases[phraseIndex]);
  }, []);

  return (
    <div 
      className="relative w-[90%] mx-auto rounded-[25px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden animate-float"
      style={{
        backgroundImage: `url(${balloonBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'float 4s ease-in-out infinite',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-[#FFF7FA]/60 to-[#F9E4EC]/50 backdrop-blur-[2px]" />
      
      {/* Content */}
      <div className="relative p-8 flex items-center justify-center min-h-[120px]">
        <p 
          className="text-center text-lg md:text-xl font-light leading-relaxed"
          style={{ 
            color: '#B76E79',
            fontFamily: "'Poppins', 'Sofia Sans', sans-serif"
          }}
        >
          {currentPhrase}
        </p>
      </div>

      {/* Decorative floral icon */}
      <svg 
        className="absolute bottom-3 right-4 w-8 h-8 opacity-15"
        viewBox="0 0 24 24" 
        fill="currentColor"
        style={{ color: '#B76E79' }}
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.5-6H14a.5.5 0 1 0 0-1H8.5a.5.5 0 1 0 0 1zm7-4H16a.5.5 0 1 0 0-1h-.5a.5.5 0 1 0 0 1z"/>
      </svg>
    </div>
  );
};

// Add animation styles to index.css if not present
