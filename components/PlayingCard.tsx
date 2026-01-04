
import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { Crown } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  isRevealed: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, isRevealed, size = 'md', onClick }) => {
  const [shouldGlow, setShouldGlow] = useState(false);

  // Trigger glow effect when card transitions to revealed state
  useEffect(() => {
    if (isRevealed) {
      setShouldGlow(true);
      const timer = setTimeout(() => setShouldGlow(false), 1000); // Glow lasts 1s
      return () => clearTimeout(timer);
    } else {
      setShouldGlow(false);
    }
  }, [isRevealed]);

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'S': return '♠';
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'X': return '🤡'; // Joker icon
      default: return '';
    }
  };

  const getColor = (suit: string) => {
    if (suit === 'X') return 'text-purple-600';
    return (suit === 'H' || suit === 'D') ? 'text-red-600' : 'text-slate-900';
  };

  const getDisplayNumber = (num: number, suit: string) => {
    if (suit === 'X') return 'JOKER';
    switch (num) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return num.toString();
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-32 h-48 text-lg',
    lg: 'w-40 h-56 text-2xl',
  };

  const renderPips = () => {
    // For small cards
    if (size === 'sm') {
      return (
        <div className="flex items-center justify-center h-full text-4xl">
           {card.suit === 'X' ? '🤡' : getSuitIcon(card.suit)}
        </div>
      );
    }

    // Joker Display
    if (card.suit === 'X') {
       return (
         <div className="flex flex-col items-center justify-center h-full text-purple-600">
            <div className="text-6xl mb-2">🤡</div>
            <div className="font-bold font-serif text-xl tracking-widest">JOKER</div>
         </div>
       );
    }

    const num = card.number;
    const suit = getSuitIcon(card.suit);
    
    // Face cards
    if (num > 10) {
      let label = '';
      if (num === 11) label = 'J';
      if (num === 12) label = 'Q';
      if (num === 13) label = 'K';
      
      return (
        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-gray-100 rounded m-2 relative overflow-hidden">
           <div className="absolute text-[8rem] opacity-10 pointer-events-none">{suit}</div>
           <div className="text-4xl font-serif font-bold z-10">{label}</div>
           <div className="text-2xl">{suit}</div>
        </div>
      );
    }

    // Ace
    if (num === 1) {
       return (
         <div className="flex items-center justify-center h-full">
            <div className="text-6xl">{suit}</div>
         </div>
       );
    }

    // Pips Logic (1-10)
    const pips: React.CSSProperties[] = [];
    // ... (Existing pip logic kept for brevity, it works for 1-10) ...
    const P = '15%'; const V = '8%';
    const TL = { top: V, left: P }; const TR = { top: V, right: P };
    const BL = { bottom: V, left: P }; const BR = { bottom: V, right: P };
    const TC = { top: V, left: '50%', transform: 'translateX(-50%)' };
    const BC = { bottom: V, left: '50%', transform: 'translateX(-50%)' };
    const ML = { top: '50%', left: P, transform: 'translateY(-50%)' };
    const MR = { top: '50%', right: P, transform: 'translateY(-50%)' };
    const MC = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const TM = { top: '35%', left: '50%', transform: 'translate(-50%, -50%)' }; 
    const BM = { bottom: '35%', left: '50%', transform: 'translate(-50%, 50%)' }; 
    const ML_High = { top: '38%', left: P, transform: 'translateY(-50%)' };
    const MR_High = { top: '38%', right: P, transform: 'translateY(-50%)' };
    const ML_Low  = { top: '62%', left: P, transform: 'translateY(-50%)' };
    const MR_Low  = { top: '62%', right: P, transform: 'translateY(-50%)' };
    const TM_10 = { top: '25%', left: '50%', transform: 'translate(-50%, -50%)' };
    const BM_10 = { bottom: '25%', left: '50%', transform: 'translate(-50%, 50%)' };

    switch(num) {
      case 2: pips.push(TC, BC); break;
      case 3: pips.push(TC, MC, BC); break;
      case 4: pips.push(TL, TR, BL, BR); break;
      case 5: pips.push(TL, TR, MC, BL, BR); break;
      case 6: pips.push(TL, TR, ML, MR, BL, BR); break;
      case 7: pips.push(TL, TR, ML, MR, BL, BR, TM); break;
      case 8: pips.push(TL, TR, ML, MR, BL, BR, TM, BM); break;
      case 9: pips.push(TL, TR, BL, BR, ML_High, MR_High, ML_Low, MR_Low, MC); break;
      case 10: pips.push(TL, TR, BL, BR, ML_High, MR_High, ML_Low, MR_Low, TM_10, BM_10); break;
    }

    return (
       <div className="relative w-full h-full text-xl leading-none">
         {pips.map((style, i) => (
           <div key={i} className="absolute" style={style}>
             {suit}
           </div>
         ))}
       </div>
    );
  };

  return (
    <div 
      className={`relative perspective-1000 cursor-pointer ${sizeClasses[size]}`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full transition-transform duration-700 transform-style-3d shadow-md rounded-xl border border-gray-300 ${isRevealed ? 'rotate-y-180' : ''} ${shouldGlow ? 'animate-glow-burst' : ''}`}
      >
        {/* Back of Card */}
        <div className="absolute w-full h-full bg-cny-dark backface-hidden rounded-xl flex items-center justify-center border-4 border-white">
             <div className="text-cny-gold font-bold text-opacity-50 text-4xl border-2 border-cny-gold rounded-full p-2 w-16 h-16 flex items-center justify-center">福</div>
        </div>

        {/* Front of Card */}
        <div className={`absolute w-full h-full bg-white backface-hidden rotate-y-180 rounded-xl flex flex-col justify-between p-2 ${getColor(card.suit)}`}>
           {/* Top Left Corner */}
           <div className="text-left font-bold leading-none flex flex-col items-center w-6">
             <div className="text-lg">{card.suit === 'X' ? 'JK' : getDisplayNumber(card.number, card.suit)}</div>
             <div className="text-sm">{card.suit === 'X' ? '' : getSuitIcon(card.suit)}</div>
           </div>

           {/* Center Content (Pips) */}
           <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
             {renderPips()}
           </div>

           {/* Bottom Right Corner (Inverted) */}
           <div className="text-left font-bold leading-none flex flex-col items-center w-6 self-end transform rotate-180">
             <div className="text-lg">{card.suit === 'X' ? 'JK' : getDisplayNumber(card.number, card.suit)}</div>
             <div className="text-sm">{card.suit === 'X' ? '' : getSuitIcon(card.suit)}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlayingCard;
