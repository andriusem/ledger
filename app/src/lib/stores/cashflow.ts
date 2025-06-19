import { writable, type Writable } from 'svelte/store';
import type { CashFlow } from '../db';
import { db } from '../db';
import { browser } from '$app/environment';

// Reactive store backed by IndexedDB via Dexie
function createCashflowStore() {
  const { subscribe, set, update }: Writable<CashFlow[]> = writable([]);

  const refresh = async () => {
    if (!browser || !db) return set([]);
    const all = await db.cashflows.orderBy('createdAt').reverse().toArray();
    set(all);
  };

  const add = async (flow: Omit<CashFlow, 'id'>) => {
    if (!browser || !db) return;
    await db.cashflows.add(flow);
    await refresh();
  };

  const remove = async (id: number) => {
    if (!browser || !db) return;
    await db.cashflows.delete(id);
    await refresh();
  };

  // Initial load (client only)
  if (browser) refresh();

  return {
    subscribe,
    add,
    remove,
    refresh
  };
}

export const cashflows = createCashflowStore();
