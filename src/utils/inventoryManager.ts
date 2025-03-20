import { DrinkItem } from '../data/drinkItems';

const STORAGE_KEY = 'drinkInventory';

export const saveInventory = (inventory: string[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
};

export const loadInventory = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const addToInventory = (itemId: string): void => {
  const current = loadInventory();
  if (!current.includes(itemId)) {
    saveInventory([...current, itemId]);
  }
};

export const removeFromInventory = (itemId: string): void => {
  const current = loadInventory();
  saveInventory(current.filter(id => id !== itemId));
};

export const isInInventory = (itemId: string): boolean => {
  return loadInventory().includes(itemId);
}; 