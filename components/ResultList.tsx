import React from 'react';
import { DrawResult, GROUP_CONFIG, GroupType } from '../types';

interface ResultListProps {
  results: DrawResult[];
}

const ResultList: React.FC<ResultListProps> = ({ results }) => {
  // Helper to categorize results based on card suit/ID
  const getGroup = (cardId: string): GroupType | null => {
    if (cardId === 'Joker') return 'camera';
    if (cardId.startsWith('S')) return 'camera';
    if (cardId.startsWith('H')) return 'engineer';
    return null;
  };

  const cameraResults = results.filter(r => getGroup(r.card.id) === 'camera');
  const engineerResults = results.filter(r => getGroup(r.card.id) === 'engineer');

  // Sort helper: Joker first, then numbers
  const sortResults = (a: DrawResult, b: DrawResult) => {
    if (a.card.suit === 'X') return -1;
    if (b.card.suit === 'X') return 1;
    return a.card.number - b.card.number;
  };

  const renderGroup = (groupKey: GroupType, groupResults: DrawResult[]) => {
    const config = GROUP_CONFIG[groupKey];
    const sorted = [...groupResults].sort(sortResults);

    return (
      <div className="mb-8 last:mb-0">
        <h4 className={`text-lg font-bold mb-4 ${config.color} border-b-2 border-gray-100 pb-2 flex justify-between items-end`}>
          <span>{config.label} ({sorted.length}人)</span>
          <span className="text-xs text-gray-400 font-normal">已固定配對</span>
        </h4>
        
        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm italic py-4 text-center bg-gray-50 rounded-lg">
            尚未進行抽籤
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sorted.map(r => {
               let cardText = '';
               let cardColor = '';
               
               if (r.card.id === 'Joker') {
                   cardText = '🤡 JOKER';
                   cardColor = 'text-purple-600';
               } else {
                   const suitIcon = r.card.suit === 'S' ? '♠' : '♥';
                   const getNum = (n: number) => n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : n;
                   cardText = `${suitIcon} ${getNum(r.card.number)}`;
                   cardColor = r.card.suit === 'H' ? 'text-red-600' : 'text-slate-800';
               }

               return (
                 <div key={r.employeeId} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className={`font-bold text-xl mb-1 ${cardColor}`}>{cardText}</div>
                    <div className="w-full h-px bg-gray-100 my-1"></div>
                    <div className="text-gray-800 font-medium truncate w-full text-center">{r.employeeName}</div>
                 </div>
               )
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-slate-600">
       <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
         📜 已抽籤結果一覽
       </h3>
       <p className="text-sm text-gray-500 mb-6 -mt-4">
         以下為各組別已完成抽籤的固定配對名單。
       </p>
       
       {renderGroup('camera', cameraResults)}
       {renderGroup('engineer', engineerResults)}
    </div>
  );
};

export default ResultList;
