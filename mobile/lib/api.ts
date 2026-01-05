import { supabase } from './supabase';
import { ExpenseData, IncomeData, BudgetData, UserData } from './types';
import {
    getCachedExpenses,
    setCachedExpenses,
    getCachedIncomes,
    setCachedIncomes,
    getCachedBudgets,
    setCachedBudgets,
    clearCache,
} from './cache';

// API base URL for web backend (if using the existing Next.js API)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getCurrentUser(): Promise<UserData | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return null;

        const response = await fetch(`${API_BASE_URL}/api/user-categories`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// ============================================================================
// EXPENSE OPERATIONS
// ============================================================================

export async function fetchExpenses(forceRefresh = false): Promise<ExpenseData[]> {
    try {
        if (!forceRefresh) {
            const cached = await getCachedExpenses();
            if (cached) return cached;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/fetch-expenses`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }

        const data = await response.json();
        const expenses = data.expenses || [];
        await setCachedExpenses(expenses);
        return expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
}

export async function submitExpense(expense: Omit<ExpenseData, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseData | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/submit-expense`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(expense),
        });

        if (!response.ok) {
            throw new Error('Failed to submit expense');
        }

        await clearCache(); // Clear cache to force refresh
        return await response.json();
    } catch (error) {
        console.error('Error submitting expense:', error);
        return null;
    }
}

export async function deleteExpense(id: number): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/delete-expense`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) return false;
        await clearCache();
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        return false;
    }
}

// ============================================================================
// INCOME OPERATIONS
// ============================================================================

export async function fetchIncomes(forceRefresh = false): Promise<IncomeData[]> {
    try {
        if (!forceRefresh) {
            const cached = await getCachedIncomes();
            if (cached) return cached;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/fetch-income`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch incomes');
        }

        const data = await response.json();
        const incomes = data.incomes || [];
        await setCachedIncomes(incomes);
        return incomes;
    } catch (error) {
        console.error('Error fetching incomes:', error);
        return [];
    }
}

export async function submitIncome(income: Omit<IncomeData, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeData | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/submit-income`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(income),
        });

        if (!response.ok) {
            throw new Error('Failed to submit income');
        }

        await clearCache();
        return await response.json();
    } catch (error) {
        console.error('Error submitting income:', error);
        return null;
    }
}

export async function deleteIncome(id: number): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/delete-income`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) return false;
        await clearCache();
        return true;
    } catch (error) {
        console.error('Error deleting income:', error);
        return false;
    }
}

// ============================================================================
// BUDGET OPERATIONS
// ============================================================================

export async function fetchBudgets(forceRefresh = false): Promise<BudgetData[]> {
    try {
        if (!forceRefresh) {
            const cached = await getCachedBudgets();
            if (cached) return cached;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/fetch-budget`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch budgets');
        }

        const data = await response.json();
        const budgets = data.budgets || [];
        await setCachedBudgets(budgets);
        return budgets;
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return [];
    }
}

export async function submitBudget(budget: { amount: number; date: string }): Promise<BudgetData | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/submit-budget`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(budget),
        });

        if (!response.ok) {
            throw new Error('Failed to submit budget');
        }

        await clearCache();
        return await response.json();
    } catch (error) {
        console.error('Error submitting budget:', error);
        return null;
    }
}

// ============================================================================
// AGGREGATED DATA (for dashboard)
// ============================================================================

export async function fetchAllData(forceRefresh = false): Promise<{
    expenses: ExpenseData[];
    incomes: IncomeData[];
    budgets: BudgetData[];
}> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            // Not authenticated - return empty data (user can still view the app)
            console.log('Not authenticated, returning empty data');
            return { expenses: [], incomes: [], budgets: [] };
        }

        // Try cache first if not forcing refresh
        if (!forceRefresh) {
            const [cachedExpenses, cachedIncomes, cachedBudgets] = await Promise.all([
                getCachedExpenses(),
                getCachedIncomes(),
                getCachedBudgets(),
            ]);

            if (cachedExpenses && cachedIncomes && cachedBudgets) {
                return {
                    expenses: cachedExpenses,
                    incomes: cachedIncomes,
                    budgets: cachedBudgets,
                };
            }
        }

        // Fetch from API
        const response = await fetch(`${API_BASE_URL}/api/fetch-all-data`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Cache the data
        await Promise.all([
            setCachedExpenses(data.expenses || []),
            setCachedIncomes(data.incomes || []),
            setCachedBudgets(data.budgets || []),
        ]);

        return {
            expenses: data.expenses || [],
            incomes: data.incomes || [],
            budgets: data.budgets || [],
        };
    } catch (error) {
        console.error('Error fetching all data:', error);
        return { expenses: [], incomes: [], budgets: [] };
    }
}
