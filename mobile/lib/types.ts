// Database Types for Finance Tracker Mobile
// Matching the web app's schema

export interface Category {
    value: string;
    label: string;
    icon: string;
}

export interface ExpenseData {
    id?: number;
    user_id?: number;
    timestamp?: string;
    date: string;
    amount: number;
    category: string;
    description?: string;
    source?: string;
    external_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IncomeData {
    id?: number;
    user_id?: number;
    timestamp?: string;
    date: string;
    amount: number;
    category: string;
    description?: string;
    source?: string;
    external_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BudgetData {
    id?: number;
    user_id?: number;
    timestamp?: string;
    date: string;
    amount: number;
    notes?: string;
    budget_type?: string;
    period_start?: string;
    period_end?: string;
    source?: string;
    external_id?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface UserData {
    id: number;
    email: string;
    avatar?: string;
    sheet_id?: string;
    expense_categories: Category[];
    income_categories: Category[];
    monthly_budget: number;
    preferences: Record<string, any>;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ChartData {
    name: string;
    value: number;
    color: string;
}

// Default expense categories (Indonesian)
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
    { value: '🍔 Makan & Minum', label: 'Makan & Minum', icon: 'restaurant' },
    { value: '🥫 Camilan', label: 'Camilan', icon: 'ice-cream' },
    { value: '🛒 Bahan Masak', label: 'Bahan Masak', icon: 'cart' },
    { value: '🚗 Transportasi', label: 'Transportasi', icon: 'car' },
    { value: '🎓 Pendidikan', label: 'Pendidikan', icon: 'school' },
    { value: '🍿 Hiburan', label: 'Hiburan', icon: 'film' },
    { value: '🎁 Hadiah & Donasi', label: 'Hadiah & Donasi', icon: 'gift' },
    { value: '😊 Keluarga', label: 'Keluarga', icon: 'people' },
    { value: '💊 Kesehatan', label: 'Kesehatan', icon: 'medkit' },
    { value: '🧾 Tagihan & Lainnya', label: 'Tagihan & Lainnya', icon: 'document' },
    { value: '💵 Biaya-biaya', label: 'Biaya-biaya', icon: 'cash' },
    { value: '🛍️ Belanja', label: 'Belanja', icon: 'bag' },
    { value: '💰 Investasi', label: 'Investasi', icon: 'trending-up' },
    { value: '🏠 Akomodasi', label: 'Akomodasi', icon: 'home' },
    { value: '🎲 Lainnya', label: 'Lainnya', icon: 'ellipsis-horizontal' },
];

// Default income categories (Indonesian)
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
    { value: '💰 Gaji', label: 'Gaji', icon: 'wallet' },
    { value: '✍🏼 Event', label: 'Event', icon: 'calendar' },
    { value: '💼 Bisnis', label: 'Bisnis', icon: 'briefcase' },
    { value: '🎁 Hadiah', label: 'Hadiah', icon: 'gift' },
    { value: '🎲 Lainnya', label: 'Lainnya', icon: 'ellipsis-horizontal' },
];

// Chart colors palette
export const CHART_COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#7BC043', '#F37735',
    '#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8',
];
