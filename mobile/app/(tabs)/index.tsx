import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '@/components/useColorScheme';
import {
  ExpenseData,
  IncomeData,
  CHART_COLORS,
} from '@/lib/types';
import { fetchAllData } from '@/lib/api';
import {
  formatCurrency,
  formatCompactCurrency,
  filterByMonth,
  calculateTotal,
  groupByCategory,
  getMonthName,
  extractCategoryLabel,
} from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [incomes, setIncomes] = useState<IncomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<'expense' | 'income'>('expense');

  // Fetch data
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      const data = await fetchAllData(forceRefresh);
      setExpenses(data.expenses);
      setIncomes(data.incomes);
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

  // Filter data by current month
  const filteredExpenses = filterByMonth(expenses, currentMonth, currentYear);
  const filteredIncomes = filterByMonth(incomes, currentMonth, currentYear);

  // Calculate totals
  const totalExpenses = calculateTotal(filteredExpenses);
  const totalIncome = calculateTotal(filteredIncomes);
  const balance = totalIncome - totalExpenses;

  // Prepare chart data
  const chartData = React.useMemo(() => {
    const data = mode === 'expense' ? filteredExpenses : filteredIncomes;
    const grouped = groupByCategory(data);

    return Array.from(grouped.entries())
      .map(([category, value], index) => ({
        value,
        text: extractCategoryLabel(category),
        color: CHART_COLORS[index % CHART_COLORS.length],
        label: category,
      }))
      .sort((a, b) => b.value - a.value);
  }, [mode, filteredExpenses, filteredIncomes]);

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

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // Styles
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
      marginBottom: 16,
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
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryCard: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    incomeCard: {
      backgroundColor: isDark ? '#065F46' : '#D1FAE5',
    },
    expenseCard: {
      backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
    },
    balanceCard: {
      backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE',
    },
    summaryLabel: {
      fontSize: 12,
      color: isDark ? '#D1D5DB' : '#6B7280',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    incomeValue: {
      color: isDark ? '#34D399' : '#059669',
    },
    expenseValue: {
      color: isDark ? '#F87171' : '#DC2626',
    },
    balanceValue: {
      color: isDark ? '#60A5FA' : '#2563EB',
    },
    chartSection: {
      padding: 16,
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: isDark ? '#6366F1' : '#FFFFFF',
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    modeButtonTextActive: {
      color: isDark ? '#FFFFFF' : '#6366F1',
    },
    chartContainer: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#F9FAFB' : '#111827',
      marginBottom: 16,
    },
    chartCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartCenterAmount: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : '#111827',
    },
    chartCenterLabel: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    legendContainer: {
      marginTop: 16,
      width: '100%',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#F3F4F6',
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    legendText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#E5E7EB' : '#374151',
    },
    legendValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#F9FAFB' : '#111827',
    },
    emptyState: {
      alignItems: 'center',
      padding: 32,
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
        <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 12 }}>
          Memuat data...
        </Text>
      </View>
    );
  }

  const total = mode === 'expense' ? totalExpenses : totalIncome;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header with month navigation and summary */}
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

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              {formatCompactCurrency(totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              {formatCompactCurrency(totalExpenses)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.summaryLabel}>Saldo</Text>
            <Text style={[styles.summaryValue, styles.balanceValue]}>
              {formatCompactCurrency(balance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'expense' && styles.modeButtonActive]}
            onPress={() => setMode('expense')}>
            <Text style={[styles.modeButtonText, mode === 'expense' && styles.modeButtonTextActive]}>
              Pengeluaran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'income' && styles.modeButtonActive]}
            onPress={() => setMode('income')}>
            <Text style={[styles.modeButtonText, mode === 'income' && styles.modeButtonTextActive]}>
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {chartData.length > 0 ? (
            <>
              <PieChart
                data={chartData}
                donut
                radius={100}
                innerRadius={60}
                centerLabelComponent={() => (
                  <View style={styles.chartCenter}>
                    <Text style={styles.chartCenterAmount}>
                      {formatCompactCurrency(total)}
                    </Text>
                    <Text style={styles.chartCenterLabel}>
                      {mode === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </Text>
                  </View>
                )}
              />
              {/* Legend */}
              <View style={styles.legendContainer}>
                {chartData.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}</Text>
                    <Text style={styles.legendValue}>{formatCompactCurrency(item.value)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={mode === 'expense' ? 'wallet-outline' : 'cash-outline'}
                size={48}
                color={isDark ? '#4B5563' : '#D1D5DB'}
              />
              <Text style={styles.emptyText}>
                Belum ada {mode === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
