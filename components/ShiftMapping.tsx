
import React, { useState, useRef } from 'react';
import { ShiftDefinition, GROUP_CONFIG, GroupType, Card } from '../types';
import { Calendar, Plus, X, Upload } from 'lucide-react';

interface ShiftMappingProps {
  shifts: ShiftDefinition[];
  setShifts: React.Dispatch<React.SetStateAction<ShiftDefinition[]>>;
}

const ShiftMapping: React.FC<ShiftMappingProps> = ({ shifts, setShifts }) => {
  const [newShiftName, setNewShiftName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupType>('camera');
  const [selectedNumber, setSelectedNumber] = useState<string>('1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addShift = () => {
    if (!newShiftName) return;
    
    // Construct Card ID
    let requiredCard = '';
    const suit = GROUP_CONFIG[selectedGroup].suit;

    if (selectedNumber === 'Joker') {
        requiredCard = 'Joker';
    } else {
        requiredCard = `${suit}-${selectedNumber}`;
    }

    const newShift: ShiftDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: newShiftName,
      requiredCard
    };

    setShifts(prev => [...prev, newShift]);
    setNewShiftName('');
  };

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      processShiftCSV(event.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processShiftCSV = (content: string) => {
    const lines = content.split(/\r?\n/);
    const newShifts: ShiftDefinition[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('班次') || trimmed.startsWith('休假')) return;

      const parts = trimmed.split(/,|，/);
      if (parts.length >= 3) {
        const name = parts[0].trim();
        const groupStr = parts[1].trim();
        const numStr = parts[2].trim();

        let group: GroupType = 'camera';
        if (groupStr.includes('攝') || groupStr.toUpperCase() === 'H') group = 'camera';
        else if (groupStr.includes('工') || groupStr.toUpperCase() === 'D') group = 'engineer';
        
        let requiredCard = '';
        if (numStr.toLowerCase() === 'joker' || numStr === '0' || numStr === '鬼牌') {
            requiredCard = 'Joker';
        } else {
            let num = parseInt(numStr.replace(/\D/g, '')) || 1;
            // Boundaries
            if (group === 'camera' && num > 10) num = 10;
            if (group === 'engineer' && num > 7) num = 7;
            const suit = GROUP_CONFIG[group].suit;
            requiredCard = `${suit}-${num}`;
        }

        newShifts.push({
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          requiredCard: requiredCard
        });
      }
    });

    if (newShifts.length > 0) {
      setShifts(prev => [...prev, ...newShifts]);
      alert(`已成功匯入 ${newShifts.length} 筆休假設定`);
    }
  };

  // Determine available numbers based on group
  const getNumberOptions = () => {
    if (selectedGroup === 'camera') return ['Joker', ...Array.from({length: 10}, (_, i) => (i + 1).toString())]; // Joker, 1-10
    if (selectedGroup === 'engineer') return Array.from({length: 7}, (_, i) => (i + 1).toString()); // 1-7
    return [];
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-cny-dark">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-cny-dark">
            <Calendar className="w-5 h-5" />
            休假日期對應設定
          </h3>
          <p className="text-sm text-gray-500">
             設定哪個休假時段對應哪張撲克牌。
          </p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-1 border border-blue-200"
           >
             <Upload className="w-3 h-3" /> 匯入 CSV
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-red-50 p-4 rounded-lg">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-500 mb-1">休假時段名稱</label>
          <input
            type="text"
            value={newShiftName}
            onChange={(e) => setNewShiftName(e.target.value)}
            placeholder="例：第一梯休假"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-cny-red outline-none"
          />
        </div>
        
        <div>
           <label className="block text-xs font-bold text-gray-500 mb-1">組別</label>
           <select 
             value={selectedGroup}
             onChange={(e) => {
                 setSelectedGroup(e.target.value as GroupType);
                 setSelectedNumber('1');
             }}
             className="p-2 border rounded bg-white min-w-[100px]"
           >
             {Object.entries(GROUP_CONFIG).map(([key, config]) => (
               <option key={key} value={key}>{config.label}</option>
             ))}
           </select>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-500 mb-1">牌號</label>
           <select 
             value={selectedNumber}
             onChange={(e) => setSelectedNumber(e.target.value)}
             className="p-2 border rounded bg-white w-20"
           >
             {getNumberOptions().map(num => (
               <option key={num} value={num}>{num}</option>
             ))}
           </select>
        </div>

        <button
          onClick={addShift}
          className="bg-cny-red text-white font-bold py-2 px-4 rounded hover:bg-red-700 flex items-center gap-1 h-10 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> 新增
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {shifts.map(shift => {
          let displayName = '';
          let colorClass = '';

          if (shift.requiredCard === 'Joker') {
              displayName = '🤡 JOKER';
              colorClass = 'text-purple-600';
          } else {
              const [suit, numStr] = shift.requiredCard.split('-');
              const suitIcon = suit === 'S' ? '♠' : '♥';
              colorClass = suit === 'H' ? 'text-red-600' : 'text-slate-800';
              displayName = `${suitIcon} ${numStr}`;
          }

          // Identify Group from card
          let groupLabel = '';
          if (shift.requiredCard === 'Joker') groupLabel = '攝影班'; // Now Joker belongs to Camera
          else if (shift.requiredCard.startsWith('S')) groupLabel = '攝影班';
          else if (shift.requiredCard.startsWith('H')) groupLabel = '工程班';

          return (
            <div key={shift.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="font-bold text-gray-800">{shift.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  需: <span className={`font-bold ${colorClass}`}>
                    {groupLabel} {displayName}
                  </span>
                </div>
              </div>
              <button onClick={() => removeShift(shift.id)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {shifts.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            尚未設定休假對應。
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftMapping;
