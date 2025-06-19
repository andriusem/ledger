import Dexie, { type Table } from 'dexie';

/*
 Offline-first IndexedDB wrapper using Dexie.js.
 The schema covers the MVP entities:
  - income
  - expense
  - stock movement
 Primary keys are auto-incremented numbers; we also store a day string (YYYY-MM-DD) to ease grouping.
*/

export interface CashFlow {
  id?: number; // Auto-increment
  type: 'income' | 'expense';
  amount: number; // In cents (int) for precision
  category: string; // e.g., "Fuel", "Sales"
  note?: string;
  day: string; // YYYY-MM-DD (local)
  createdAt: number; // epoch ms
}

export interface StockMove {
  id?: number;
  category: string; // e.g., "Sugar"
  delta: number; // Positive in, negative out
  note?: string;
  day: string;
  createdAt: number;
}

class AppDatabase extends Dexie {
  cashflows!: Table<CashFlow, number>;
  stockMoves!: Table<StockMove, number>;

  constructor() {
    super('ledger_db');

    this.version(1).stores({
      cashflows: '++id, day, type, category',
      stockMoves: '++id, day, category'
    });
  }
}

export const db = typeof window === 'undefined' ? null : new AppDatabase();
