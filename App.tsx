
import React, { useState } from 'react';
import { Crown, List } from 'lucide-react';
import LotterySection from './components/LotterySection';
import ShiftMapping from './components/ShiftMapping';
import ResultList from './components/ResultList';
import { DrawResult, ShiftDefinition, GROUP_CONFIG, GroupType } from './types';

function App() {
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Header */}
      <header className="bg-cny-dark text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-cny-gold p-2 rounded-full text-cny-dark">
               <Crown size={24} />
             </div>
             <h1 className="text-xl font-bold tracking-wide">春節休假抽籤大亂鬥</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-4">
          <div className="space-y-8">
            {/* 1. Card Drawing */}
            <LotterySection 
              shifts={shifts}
              onResultsUpdate={(results: any[]) => {
                 setDrawResults(results);
              }} 
            />

            {/* 2. Shift Definition */}
            <ShiftMapping shifts={shifts} setShifts={setShifts} />

            {/* 3. Drawn Results List */}
            <ResultList results={drawResults} />

            {/* 4. Final Result Action */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setShowResultModal(true)}
                className="bg-cny-gold text-cny-dark font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all flex items-center gap-2 border-4 border-white"
              >
                <Crown /> 查看最終休假表
              </button>
            </div>
          </div>
      </main>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="bg-cny-red p-4 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">🎉 2025 春節休假最終結果</h2>
              <button onClick={() => setShowResultModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/red-paper.png')]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shifts.map(shift => {
                  // Find match
                  const match = drawResults.find(r => r.card.id === shift.requiredCard);
                  const name = match?.employeeName || '尚未抽出';
                  
                  // Visuals
                  let cardDisplay = '';
                  let groupLabel = '';
                  
                  if (shift.requiredCard === 'Joker') {
                      cardDisplay = '🤡 JOKER';
                      groupLabel = GROUP_CONFIG['camera'].label; // Joker belongs to Camera now
                  } else {
                      const [suit, num] = shift.requiredCard.split('-');
                      const groupType = Object.keys(GROUP_CONFIG).find(k => GROUP_CONFIG[k as GroupType].suit === suit);
                      const config = groupType ? GROUP_CONFIG[groupType as GroupType] : null;
                      groupLabel = config ? config.label : '';
                      cardDisplay = shift.requiredCard;
                  }

                  return (
                    <div key={shift.id} className="bg-white border-2 border-cny-gold rounded-lg p-4 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cny-gold text-cny-dark text-xs font-bold px-2 py-1 rounded-bl-lg">
                        {cardDisplay}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{shift.name}</h3>
                      <div className="text-sm text-gray-500 mb-3">{groupLabel}</div>
                      
                      <div className={`text-2xl font-bold text-center py-2 rounded-lg ${match ? 'bg-red-50 text-cny-red' : 'bg-gray-100 text-gray-400'}`}>
                        {name}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {shifts.length === 0 && (
                <div className="text-center py-20 text-white opacity-80">
                  尚未設定任何休假時段。請先在「休假日期對應設定」中新增時段。
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
               <button 
                 onClick={() => window.print()}
                 className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
               >
                 列印 / 存成 PDF
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
