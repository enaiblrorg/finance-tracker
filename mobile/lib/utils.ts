// Utility functions for the finance tracker

/**
 * Format currency amount (Indonesian Rupiah)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format compact currency (e.g., 1.5M, 500K)
 */
export function formatCompactCurrency(amount: number): string {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month] || '';
}

/**
 * Get short month name
 */
export function getShortMonthName(month: number): string {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[month] || '';
}

/**
 * Filter data by month/year
 */
export function filterByMonth<T extends { date: string }>(
    data: T[],
    month: number,
    year: number
): T[] {
    return data.filter((item) => {
        const date = new Date(item.date);
        return date.getMonth() === month && date.getFullYear() === year;
    });
}

/**
 * Calculate total amount from array
 */
export function calculateTotal<T extends { amount: number }>(data: T[]): number {
    return data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Group data by category for chart
 */
export function groupByCategory<T extends { category: string; amount: number }>(
    data: T[]
): Map<string, number> {
    const grouped = new Map<string, number>();

    data.forEach((item) => {
        const current = grouped.get(item.category) || 0;
        grouped.set(item.category, current + Number(item.amount));
    });

    return grouped;
}

/**
 * Extract category label from value (removes emoji prefix)
 */
export function extractCategoryLabel(categoryValue: string): string {
    // Remove emoji prefix and trim
    const match = categoryValue.match(/^[\u{1F300}-\u{1F9FF}]?\s*(.+)$/u);
    return match ? match[1].trim() : categoryValue;
}

/**
 * Evaluate simple math expressions
 */
export function evaluateMathExpression(expression: string): number | null {
    try {
        // Only allow numbers and basic operators
        const sanitized = expression.replace(/[^0-9+\-*/.()]/g, '');
        if (!sanitized) return null;

        // Use Function constructor for safe evaluation
        const result = new Function(`return ${sanitized}`)();
        return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch {
        return null;
    }
}
