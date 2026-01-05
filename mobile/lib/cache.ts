import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseData, IncomeData, BudgetData } from './types';

const CACHE_KEY_EXPENSES = 'finance_tracker_expenses_mobile';
const CACHE_KEY_INCOMES = 'finance_tracker_incomes_mobile';
const CACHE_KEY_BUDGETS = 'finance_tracker_budgets_mobile';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface CacheData<T> {
    data: T[];
    timestamp: number;
}

export async function getCache<T>(key: string): Promise<CacheData<T> | null> {
    try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
            return JSON.parse(cached);
        }
        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

export async function setCache<T>(key: string, data: T[]): Promise<void> {
    try {
        const cacheData: CacheData<T> = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

export function isCacheValid<T>(cache: CacheData<T> | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
}

export async function clearCache(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([
            CACHE_KEY_EXPENSES,
            CACHE_KEY_INCOMES,
            CACHE_KEY_BUDGETS,
        ]);
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

export async function getCachedExpenses(): Promise<ExpenseData[] | null> {
    const cache = await getCache<ExpenseData>(CACHE_KEY_EXPENSES);
    if (isCacheValid(cache)) {
        return cache!.data;
    }
    return null;
}

export async function setCachedExpenses(data: ExpenseData[]): Promise<void> {
    await setCache(CACHE_KEY_EXPENSES, data);
}

export async function getCachedIncomes(): Promise<IncomeData[] | null> {
    const cache = await getCache<IncomeData>(CACHE_KEY_INCOMES);
    if (isCacheValid(cache)) {
        return cache!.data;
    }
    return null;
}

export async function setCachedIncomes(data: IncomeData[]): Promise<void> {
    await setCache(CACHE_KEY_INCOMES, data);
}

export async function getCachedBudgets(): Promise<BudgetData[] | null> {
    const cache = await getCache<BudgetData>(CACHE_KEY_BUDGETS);
    if (isCacheValid(cache)) {
        return cache!.data;
    }
    return null;
}

export async function setCachedBudgets(data: BudgetData[]): Promise<void> {
    await setCache(CACHE_KEY_BUDGETS, data);
}
