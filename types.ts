
export type GroupType = 'camera' | 'engineer';

export interface Employee {
  id: string;
  name: string;
  group: GroupType;
}

export interface Card {
  suit: 'S' | 'H' | 'D' | 'C' | 'X'; // Added 'X' for Joker
  number: number; // 0 for Joker
  id: string; // e.g., 'S-1', 'Joker'
}

export interface DrawResult {
  employeeId: string;
  employeeName: string; // Added to store the name permanently with the result
  card: Card;
}

export interface ShiftDefinition {
  id: string;
  name: string; // e.g., "除夕 早班"
  requiredCard: string; // e.g., "S-1"
}

export const GROUP_CONFIG: Record<GroupType, { label: string; suit: Card['suit']; color: string }> = {
  camera: { label: '攝影班', suit: 'S', color: 'text-slate-800' },   // Spades
  engineer: { label: '工程班', suit: 'H', color: 'text-red-600' },    // Hearts
};
