
import React, { useState, useRef } from 'react';
import { Users, Shuffle, Trash2, Plus, Upload, Coins } from 'lucide-react';
import { Employee, GroupType, GROUP_CONFIG, DrawResult, Card } from '../types';
import PlayingCard from './PlayingCard';

interface LotterySectionProps {
  onResultsUpdate: (results: DrawResult[]) => void;
  shifts: any[];
}

interface ChipParticle {
  id: number;
  tx: string;
  ty: string;
  rot: string;
}

const LotterySection: React.FC<LotterySectionProps> = ({ onResultsUpdate }) => {
  const [singleName, setSingleName] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]); 
  const [currentTab, setCurrentTab] = useState<GroupType>('camera');
  const [isDrawing, setIsDrawing] = useState(false);
  const [chips, setChips] = useState<ChipParticle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Parsing logic maintained for bulk upload if needed
  const processContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    const newEmployees: Employee[] = [];
    const duplicates: string[] = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const parts = trimmed.split(/,|，/);
      let name = '';
      let group: GroupType = currentTab; // Default to current tab or logic below

      if (parts.length > 1) {
        name = parts[0].trim();
        const groupStr = parts[1].trim();
        
        if (groupStr.includes('攝') || groupStr.toUpperCase() === 'H' || groupStr.toLowerCase().includes('cam')) group = 'camera';
        else if (groupStr.includes('工') || groupStr.toUpperCase() === 'D' || groupStr.toLowerCase().includes('eng')) group = 'engineer';
      } else {
        name = trimmed;
      }

      // Check for duplicates in existing employees OR in the current batch being added
      if (employees.some(e => e.name === name) || newEmployees.some(e => e.name === name)) {
        duplicates.push(name);
        return;
      }

      newEmployees.push({ id: Math.random().toString(36).substr(2, 9), name, group });
    });

    if (duplicates.length > 0) {
      alert(`警告：以下人名已存在或已抽籤，將略過不加入：\n${duplicates.join(', ')}`);
    }

    setEmployees(prev => [...prev, ...newEmployees]);
  };

  const handleAddSingle = () => {
    if (!singleName.trim()) return;
    const nameToAdd = singleName.trim();

    // Check if name already exists
    if (employees.some(e => e.name === nameToAdd)) {
      alert(`警告：${nameToAdd} 已在名單中或已完成抽籤！`);
      return;
    }

    const newEmp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: nameToAdd,
      group: currentTab
    };
    setEmployees(prev => [...prev, newEmp]);
    setSingleName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSingle();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processContent(event.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearEmployees = () => {
    if (confirm('確定要清空所有名單嗎？這將會重置所有抽籤結果！')) {
      setEmployees([]);
      setDrawResults([]);
      onResultsUpdate([]);
    }
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setDrawResults(prev => prev.filter(r => r.employeeId !== id));
  };

  const generateChips = () => {
    const newChips: ChipParticle[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * 360;
      const distance = 200 + Math.random() * 300; // Scatter distance
      const tx = `${Math.cos(angle * Math.PI / 180) * distance}px`;
      const ty = `${Math.sin(angle * Math.PI / 180) * distance}px`;
      const rot = `${Math.random() * 720}deg`;
      newChips.push({ id: i, tx, ty, rot });
    }
    setChips(newChips);
    // Cleanup chips after animation
    setTimeout(() => setChips([]), 1500);
  };

  const drawForGroup = (group: GroupType) => {
    const groupEmployees = employees.filter(e => e.group === group);
    if (groupEmployees.length === 0) return;

    // 1. Identify existing results for this group to preserve them
    const existingGroupResults = drawResults.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        return emp?.group === group;
    });

    const drawnEmployeeIds = new Set(existingGroupResults.map(r => r.employeeId));
    const usedCardIds = new Set(existingGroupResults.map(r => r.card.id));

    // 2. Identify employees who still need a card
    const employeesToDraw = groupEmployees.filter(e => !drawnEmployeeIds.has(e.id));

    if (employeesToDraw.length === 0) {
        return;
    }

    // 3. Define Full Deck
    let fullDeck: Card[] = [];
    if (group === 'camera') {
      // Spades 1-10 (10 cards) + Joker (1 card) = 11 cards
      const spades: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: 'S',
        number: i + 1,
        id: `S-${i + 1}`
      }));
      fullDeck = [...spades, { suit: 'X', number: 0, id: 'Joker' }];
    } else if (group === 'engineer') {
      // Hearts 1-7 (Total 7)
      fullDeck = Array.from({ length: 7 }, (_, i) => ({
        suit: 'H',
        number: i + 1,
        id: `H-${i + 1}`
      }));
    }

    // 4. Filter Available Cards
    const availableDeck = fullDeck.filter(c => !usedCardIds.has(c.id));

    if (employeesToDraw.length > availableDeck.length) {
      alert(`卡牌不足！\n需抽籤人數：${employeesToDraw.length} 人\n剩餘可用卡牌：${availableDeck.length} 張\n請檢查人數或清空重來。`);
      return;
    }

    setIsDrawing(true);

    // 5. Shuffle Available Deck
    const deckToDraw = [...availableDeck];
    for (let i = deckToDraw.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckToDraw[i], deckToDraw[j]] = [deckToDraw[j], deckToDraw[i]];
    }

    // 6. Assign Cards
    const newResults: DrawResult[] = employeesToDraw.map((emp, index) => ({
      employeeId: emp.id,
      employeeName: emp.name,
      card: deckToDraw[index]
    }));

    // Animation Sequence
    // T=0: Start shuffling (buttons disabled, cards back)
    
    // T=800ms: Explosion of Chips
    setTimeout(() => {
        generateChips();
    }, 800);

    // T=1200ms: Reveal Cards (State Update)
    setTimeout(() => {
      setDrawResults(prev => {
        const updated = [...prev, ...newResults];
        onResultsUpdate(updated);
        return updated;
      });
      setIsDrawing(false);
    }, 1200);
  };

  const currentGroupEmployees = employees.filter(e => e.group === currentTab);
  const currentGroupResults = drawResults.filter(r => 
    employees.find(e => e.id === r.employeeId)?.group === currentTab
  );

  // Check if all employees in the current group have a result
  const allDrawn = currentGroupEmployees.length > 0 && currentGroupEmployees.every(e => 
    currentGroupResults.some(r => r.employeeId === e.id)
  );

  // Calculate remaining cards
  const totalDeckSize = currentTab === 'camera' ? 11 : 7;
  const remainingCardsCount = Math.max(0, totalDeckSize - currentGroupResults.length);

  return (
    <div className="space-y-6">
      {/* Floating Chips Container */}
      {chips.map(chip => (
        <div 
            key={chip.id} 
            className="chip-animate flex items-center justify-center"
            style={{ 
                '--tx': chip.tx, 
                '--ty': chip.ty,
                '--rot': chip.rot
            } as React.CSSProperties}
        >
             {/* Using Lucide Coins or just a CSS Circle */}
             <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-md flex items-center justify-center text-yellow-700 font-bold text-xs">
                $
             </div>
        </div>
      ))}

      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-cny-red">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-cny-dark">
          <Users className="w-5 h-5" />
          人員名單輸入
        </h3>
        
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(Object.keys(GROUP_CONFIG) as GroupType[]).map(g => (
            <button
              key={g}
              onClick={() => setCurrentTab(g)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                currentTab === g 
                  ? 'bg-cny-red text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {GROUP_CONFIG[g].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`輸入${GROUP_CONFIG[currentTab].label}人員姓名...`}
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-cny-red outline-none shadow-sm"
              />
              <button 
                onClick={handleAddSingle}
                disabled={!singleName.trim()}
                className="bg-cny-gold hover:bg-yellow-500 text-cny-dark font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" /> 新增
              </button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg flex items-center gap-2 border border-blue-200"
              >
                <Upload className="w-4 h-4" /> 批量上傳 CSV
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />

              <button 
                onClick={clearEmployees}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded-lg flex items-center gap-2 border border-gray-200 ml-auto"
              >
                <Trash2 className="w-4 h-4" /> 清空名單
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
               * 攝影班: 黑桃 1-10 + 鬼牌 (共11張) | 工程班: 紅桃 1-7 (共7張)
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-4 rounded-lg overflow-y-auto max-h-48 border border-gray-200">
            <h4 className="font-bold text-gray-500 mb-2 text-sm sticky top-0 bg-gray-50 pb-2 border-b">
              目前名單 ({employees.length}人) - 點擊移除
            </h4>
            <div className="flex flex-wrap gap-2 content-start">
              {employees.length === 0 && <span className="text-gray-400 text-sm py-4">暫無人員</span>}
              {employees.map(emp => {
                const isDrawn = drawResults.some(r => r.employeeId === emp.id);
                return (
                  <button 
                    key={emp.id} 
                    onClick={() => {
                        if (isDrawn) {
                            if(!confirm('這位人員已完成抽籤，移除將會刪除其配對結果。確定嗎？')) return;
                        }
                        removeEmployee(emp.id)
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1 hover:opacity-75 transition-opacity ${
                    emp.group === 'camera' ? 'bg-slate-100 border-slate-300 text-slate-700' :
                    'bg-red-50 border-red-200 text-red-700'
                  } ${isDrawn ? 'ring-2 ring-cny-gold ring-offset-1' : ''}`}>
                    {emp.name} 
                    <span className="text-xs opacity-50 ml-1">
                      {GROUP_CONFIG[emp.group].label.charAt(0)}
                    </span>
                    <XIcon />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-cny-gold min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-cny-dark flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            {GROUP_CONFIG[currentTab].label} 抽籤
          </h3>
          <button
            onClick={() => drawForGroup(currentTab)}
            disabled={allDrawn || currentGroupEmployees.length === 0 || isDrawing}
            className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${
              allDrawn || currentGroupEmployees.length === 0 || isDrawing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cny-red to-cny-dark'
            }`}
          >
            {isDrawing 
              ? '洗牌中...' 
              : allDrawn 
                ? `還有 ${remainingCardsCount} 張卡牌未抽出` 
                : '按我抽籤'}
          </button>
        </div>

        {currentGroupEmployees.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            請先輸入人員名單
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {currentGroupEmployees.map((emp) => {
              const result = currentGroupResults.find(r => r.employeeId === emp.id);
              const isBeingDrawn = isDrawing && !result;

              return (
                <div key={emp.id} className="flex flex-col items-center gap-2 w-32">
                  <div className="h-48 w-32 relative">
                     {result || isBeingDrawn ? (
                        <PlayingCard 
                            card={result ? result.card : { suit: GROUP_CONFIG[currentTab].suit, number: 1, id: 'temp' }} 
                            isRevealed={!!result} 
                            size="md" 
                        />
                     ) : (
                        <div className="w-32 h-48 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <span className="text-3xl">?</span>
                        </div>
                     )}
                  </div>
                  <span className="font-bold text-gray-700 text-center truncate w-full">{emp.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icon component
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default LotterySection;
