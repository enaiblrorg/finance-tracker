import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { ExpenseData, IncomeData } from '@/lib/types';
import { fetchAllData, deleteExpense, deleteIncome } from '@/lib/api';
import {
    formatCurrency,
    formatDate,
    filterByMonth,
    getMonthName,
    extractCategoryLabel,
} from '@/lib/utils';

type Transaction = (ExpenseData | IncomeData) & { type: 'expense' | 'income' };

export default function TransactionsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

    // Fetch data
    const loadData = useCallback(async (forceRefresh = false) => {
        try {
            const data = await fetchAllData(forceRefresh);

            // Combine and mark with type
            const combined: Transaction[] = [
                ...data.expenses.map(e => ({ ...e, type: 'expense' as const })),
                ...data.incomes.map(i => ({ ...i, type: 'income' as const })),
            ];

            setTransactions(combined);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter by month
    const filteredTransactions = React.useMemo(() => {
        let data = filterByMonth(transactions, currentMonth, currentYear);

        if (filter !== 'all') {
            data = data.filter(t => t.type === filter);
        }

        // Sort by date descending
        return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentMonth, currentYear, filter]);

    // Month navigation
    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    // Handle delete
    const handleDelete = (transaction: Transaction) => {
        Alert.alert(
            'Hapus Transaksi',
            `Yakin ingin menghapus transaksi ${formatCurrency(transaction.amount)}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = transaction.type === 'expense'
                                ? await deleteExpense(transaction.id!)
                                : await deleteIncome(transaction.id!);

                            if (success) {
                                loadData(true);
                            } else {
                                Alert.alert('Error', 'Gagal menghapus transaksi');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Terjadi kesalahan');
                        }
                    },
                },
            ]
        );
    };

    // Refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(true);
    }, [loadData]);

    // Render transaction item
    const renderItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity
            style={[
                styles.transactionItem,
                { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
            onLongPress={() => handleDelete(item)}>
            <View style={styles.transactionLeft}>
                <View
                    style={[
                        styles.typeIndicator,
                        { backgroundColor: item.type === 'expense' ? '#FEE2E2' : '#D1FAE5' },
                    ]}>
                    <Ionicons
                        name={item.type === 'expense' ? 'arrow-up' : 'arrow-down'}
                        size={16}
                        color={item.type === 'expense' ? '#EF4444' : '#10B981'}
                    />
                </View>
                <View style={styles.transactionDetails}>
                    <Text style={[styles.category, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                        {extractCategoryLabel(item.category)}
                    </Text>
                    {item.description && (
                        <Text style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                    <Text style={[styles.date, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                        {formatDate(item.date)}
                    </Text>
                </View>
            </View>
            <Text
                style={[
                    styles.amount,
                    { color: item.type === 'expense' ? '#EF4444' : '#10B981' },
                ]}>
                {item.type === 'expense' ? '-' : '+'}
                {formatCurrency(item.amount)}
            </Text>
        </TouchableOpacity>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#F3F4F6',
        },
        header: {
            padding: 16,
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        },
        monthNav: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        monthButton: {
            padding: 8,
        },
        monthText: {
            fontSize: 18,
            fontWeight: '600',
            marginHorizontal: 16,
            color: isDark ? '#F9FAFB' : '#111827',
        },
        filterRow: {
            flexDirection: 'row',
            gap: 8,
        },
        filterButton: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
        },
        filterButtonActive: {
            backgroundColor: '#6366F1',
        },
        filterText: {
            fontSize: 14,
            fontWeight: '500',
            color: isDark ? '#D1D5DB' : '#6B7280',
        },
        filterTextActive: {
            color: '#FFFFFF',
        },
        list: {
            padding: 16,
        },
        transactionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 12,
            marginBottom: 8,
        },
        transactionLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        typeIndicator: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        transactionDetails: {
            flex: 1,
        },
        category: {
            fontSize: 16,
            fontWeight: '600',
        },
        description: {
            fontSize: 14,
            marginTop: 2,
        },
        date: {
            fontSize: 12,
            marginTop: 2,
        },
        amount: {
            fontSize: 16,
            fontWeight: '700',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginTop: 12,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Month Navigation */}
                <View style={styles.monthNav}>
                    <TouchableOpacity style={styles.monthButton} onPress={() => navigateMonth('prev')}>
                        <Ionicons name="chevron-back" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {getMonthName(currentMonth)} {currentYear}
                    </Text>
                    <TouchableOpacity style={styles.monthButton} onPress={() => navigateMonth('next')}>
                        <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterRow}>
                    {(['all', 'expense', 'income'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                            onPress={() => setFilter(f)}>
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === 'all' ? 'Semua' : f === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Transaction List */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="receipt-outline"
                            size={48}
                            color={isDark ? '#4B5563' : '#D1D5DB'}
                        />
                        <Text style={styles.emptyText}>Belum ada transaksi bulan ini</Text>
                    </View>
                }
            />
        </View>
    );
}
