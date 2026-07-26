'use client'

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { subjects, subjectsIncome } from '@/lib/selections';
import { normalizeDate } from '@/lib/date-utils';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ExpenseData {
  timestamp: string;
  subject: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  reimbursed: string;
}

interface IncomeData {
  timestamp: string;
  subject: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

interface FormReportProps {
  expenses: ExpenseData[];
  incomes: IncomeData[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function formatDateRangeParts(fromDateStr: string, toDateStr: string) {
  const fromDate = fromDateStr ? new Date(fromDateStr) : null;
  const toDate = toDateStr ? new Date(toDateStr) : null;

  if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return { startPart: fromDateStr, endPart: toDateStr, suffix: '' };
  }

  const fromDay = fromDate.getDate();
  const fromMonth = fromDate.toLocaleDateString('en-GB', { month: 'short' });
  const fromYear = fromDate.getFullYear();

  const toDay = toDate.getDate();
  const toMonth = toDate.toLocaleDateString('en-GB', { month: 'short' });
  const toYear = toDate.getFullYear();

  if (fromYear === toYear && fromMonth === toMonth) {
    return {
      startPart: `${fromDay}`,
      endPart: `${toDay}`,
      suffix: `${fromMonth} ${fromYear}`,
    };
  }

  if (fromYear === toYear) {
    return {
      startPart: `${fromDay} ${fromMonth}`,
      endPart: `${toDay} ${toMonth}`,
      suffix: `${fromYear}`,
    };
  }

  return {
    startPart: `${fromDay} ${fromMonth} ${fromYear}`,
    endPart: `${toDay} ${toMonth} ${toYear}`,
    suffix: '',
  };
}

function InlineDatePicker({
  date,
  setDate,
  label,
}: {
  date: string;
  setDate: (date: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => (date ? new Date(date) : new Date()));
  const selectedDate = date ? new Date(date) : undefined;

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate.toISOString());
      setOpen(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    // Each time the picker opens, jump to the selected date's month so the
    // chosen date is visible and highlighted instead of defaulting to today.
    if (nextOpen && selectedDate) {
      setMonth(selectedDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline decoration-dotted cursor-pointer"
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-950 rounded-2xl border-none shadow-xl" align="center" collisionPadding={8}>
        <Calendar mode="single" month={month} onMonthChange={setMonth} selected={selectedDate} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

export function FormReport({ expenses, incomes, loading, error, onRefresh }: FormReportProps) {

  // Filters
  const [expenseSubjectFilters, setExpenseSubjectFilters] = useState<string[]>([]);
  const [incomeSubjectFilters, setIncomeSubjectFilters] = useState<string[]>([]);
  const [dateFromFilter, setDateFromFilter] = useState<string>(() => {
    const today = new Date();
    // Create date in local timezone to avoid UTC conversion issues
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
  });
  const [dateToFilter, setDateToFilter] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
  const [reimbursedFilter, setReimbursedFilter] = useState<string>('all');
  const [activeReportTab, setActiveReportTab] = useState('expenses');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [detailSort, setDetailSort] = useState<{ column: 'date' | 'total'; direction: 'asc' | 'desc' }>({
    column: 'date',
    direction: 'desc',
  });

  const handleDetailSort = (column: 'date' | 'total') => {
    setDetailSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'desc' }
    );
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filterData = (data: any[], type: 'expenses' | 'incomes') => {
    return data.filter(item => {
      // Subject filter
      const activeFilters = type === 'expenses' ? expenseSubjectFilters : incomeSubjectFilters;
      if (activeFilters.length > 0 && !activeFilters.includes(item.subject)) {
        return false;
      }

      // Date range filter - using the "Date" column (not timestamp)
      const itemDate = normalizeDate(item.date);
      if (dateFromFilter && itemDate && itemDate < dateFromFilter) {
        return false;
      }
      if (dateToFilter && itemDate && itemDate > dateToFilter) {
        return false;
      }

      // Reimbursed filter (only for expenses)
      if (type === 'expenses' && reimbursedFilter !== 'all' && item.reimbursed !== reimbursedFilter) {
        return false;
      }

      return true;
    });
  };

  const prepareChartData = (data: any[]): ChartData[] => {
    const categoryTotals: { [key: string]: number } = {};

    data.forEach(item => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += item.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const filteredExpenses = filterData(expenses, 'expenses');
  const filteredIncomes = filterData(incomes, 'incomes');

  const dateRangeParts = formatDateRangeParts(dateFromFilter, dateToFilter);

  const expensesChartData = prepareChartData(filteredExpenses);
  const incomesChartData = prepareChartData(filteredIncomes);

  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncomes = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);

  const handleCategoryClick = (categoryName: string, type: 'expenses' | 'incomes') => {
    if (type === 'expenses') {
      setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
      setSelectedIncomeCategory(null);
    } else {
      setSelectedIncomeCategory(selectedIncomeCategory === categoryName ? null : categoryName);
      setSelectedCategory(null);
    }
    setExpandedDate(null);
  };

  const renderDetailedTable = (type: 'expenses' | 'incomes') => {
    const activeCategory = type === 'expenses' ? selectedCategory : selectedIncomeCategory;
    if (!activeCategory) return null;

    const data = type === 'expenses' ? filteredExpenses : filteredIncomes;
    const categoryData = data.filter(item => item.category === activeCategory);

    // Group by date
    const groupedData = categoryData.reduce((acc, item) => {
      const date = normalizeDate(item.date);
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const getDayTotal = (date: string) =>
      groupedData[date].reduce((sum: number, item: ExpenseData | IncomeData) => sum + item.amount, 0);

    const sortedDates = Object.keys(groupedData).sort((a, b) => {
      const comparison =
        detailSort.column === 'date'
          ? new Date(a).getTime() - new Date(b).getTime()
          : getDayTotal(a) - getDayTotal(b);
      return detailSort.direction === 'asc' ? comparison : -comparison;
    });

    const renderSortableHead = (column: 'date' | 'total', label: string, align: 'left' | 'right' = 'left') => (
      <TableHead
        className={`cursor-pointer select-none hover:text-foreground ${align === 'right' ? 'text-right' : ''}`}
        onClick={() => handleDetailSort(column)}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end w-full' : ''}`}>
          {label}
          {detailSort.column === column && (
            detailSort.direction === 'asc'
              ? <ArrowUp className="h-3 w-3" />
              : <ArrowDown className="h-3 w-3" />
          )}
        </span>
      </TableHead>
    );

    return (
      <div className="mt-4 border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/20 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => type === 'expenses' ? setSelectedCategory(null) : setSelectedIncomeCategory(null)}
        >
          <X className="h-4 w-4" />
        </Button>
        <h5 className="font-semibold mb-4 text-center">Details for {activeCategory}</h5>
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHead('date', 'Date')}
              {renderSortableHead('total', 'Total', 'right')}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDates.map(date => {
              const dayItems = groupedData[date];
              const dayTotal = dayItems.reduce((sum: number, item: any) => sum + item.amount, 0);
              const isExpanded = expandedDate === date;

              return (
                <React.Fragment key={date}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setExpandedDate(isExpanded ? null : date)}
                  >
                    <TableCell className="font-medium">{formatDisplayDate(date)} ({dayItems.length})</TableCell>
                    <TableCell className="text-right">{formatCurrency(dayTotal)}</TableCell>
                  </TableRow>
                  {isExpanded && dayItems.map((item: any, idx: number) => (
                    <TableRow key={`${date}-${idx}`} className="bg-gray-50 dark:bg-gray-900/50 text-sm">
                      <TableCell className="pl-6 text-gray-600 dark:text-gray-400">
                        {item.description || item.subject}
                      </TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / (activeReportTab === 'expenses' ? totalExpenses : totalIncomes)) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-blue-600 font-semibold">{formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const handlePreviousMonth = () => {
    if (!dateFromFilter) return;
    const currentFrom = new Date(dateFromFilter);
    const prevMonthFirstDay = new Date(currentFrom.getFullYear(), currentFrom.getMonth() - 1, 1);
    const prevMonthLastDay = new Date(currentFrom.getFullYear(), currentFrom.getMonth(), 0);

    setDateFromFilter(`${prevMonthFirstDay.getFullYear()}-${String(prevMonthFirstDay.getMonth() + 1).padStart(2, '0')}-${String(prevMonthFirstDay.getDate()).padStart(2, '0')}`);
    setDateToFilter(`${prevMonthLastDay.getFullYear()}-${String(prevMonthLastDay.getMonth() + 1).padStart(2, '0')}-${String(prevMonthLastDay.getDate()).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    if (!dateFromFilter) return;
    const currentFrom = new Date(dateFromFilter);
    const nextMonthFirstDay = new Date(currentFrom.getFullYear(), currentFrom.getMonth() + 1, 1);
    const nextMonthLastDay = new Date(currentFrom.getFullYear(), currentFrom.getMonth() + 2, 0);

    setDateFromFilter(`${nextMonthFirstDay.getFullYear()}-${String(nextMonthFirstDay.getMonth() + 1).padStart(2, '0')}-${String(nextMonthFirstDay.getDate()).padStart(2, '0')}`);
    setDateToFilter(`${nextMonthLastDay.getFullYear()}-${String(nextMonthLastDay.getMonth() + 1).padStart(2, '0')}-${String(nextMonthLastDay.getDate()).padStart(2, '0')}`);
  };

  const refreshData = async () => {
    onRefresh();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={refreshData} variant="neutral">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Report Tabs */}
      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="incomes">Income</TabsTrigger>
        </TabsList>

        {/* Expenses Report */}
        <TabsContent value="expenses" className="space-y-2">
          {/* Filters */}
          <div className="space-y-2">

            <div className="grid grid-cols-2 gap-2">
              {/* Subject Filter */}
              <div className="space-y-2">
                <MultiSelect
                  options={subjects}
                  selected={expenseSubjectFilters}
                  onChange={setExpenseSubjectFilters}
                  placeholder="All Subjects"
                />
              </div>

              {/* Reimbursed Filter */}
              <div className="space-y-2">
                <Select value={reimbursedFilter} onValueChange={setReimbursedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reimbursed</SelectItem>
                    <SelectItem value="TRUE">Yes</SelectItem>
                    <SelectItem value="FALSE">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
          <div className="text-center !mt-4 !mb-0">
            <h4 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              Total Expenses
              <RefreshCw 
                className="h-4 w-4 cursor-pointer hover:text-primary transition-colors" 
                onClick={refreshData}
              />
            </h4>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalExpenses)}</p>
            <div className="text-sm text-primary/50 flex items-center justify-center gap-1.5 flex-wrap">
              <InlineDatePicker date={dateFromFilter} setDate={setDateFromFilter} label={dateRangeParts.startPart} />
              <span>-</span>
              <InlineDatePicker date={dateToFilter} setDate={setDateToFilter} label={dateRangeParts.endPart} />
              {dateRangeParts.suffix && <span>{dateRangeParts.suffix}</span>}
              <span>•</span>
              <span>{filteredExpenses.length} Transactions</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-64 relative flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex-1 h-full relative">
                {expensesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={expensesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(entry) => handleCategoryClick(entry.name, 'expenses')}
                        className="cursor-pointer"
                      >
                        {expensesChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            opacity={selectedCategory ? (selectedCategory === entry.name ? 1 : 0.3) : 1}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">No expense data matches the selected filters.</p>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            {/* Custom Legend */}
            {expensesChartData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {expensesChartData.map((entry) => {
                  const percentage = ((entry.value / totalExpenses) * 100).toFixed(1);
                  const isSelected = selectedCategory === entry.name;
                  return (
                    <div
                      key={entry.name}
                      className={`flex items-center gap-2 text-xs cursor-pointer p-1 rounded transition-colors ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                      onClick={() => handleCategoryClick(entry.name, 'expenses')}
                    >
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className={isSelected ? 'font-bold' : ''}>{entry.name} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
            {renderDetailedTable('expenses')}
          </div>
        </TabsContent>

        {/* Income Report */}
        <TabsContent value="incomes" className="space-y-4">
                    {/* Filters */}
          <div className="space-y-2">

            <div className="grid grid-cols-1 gap-2">
              {/* Subject Filter */}
              <div className="space-y-2">
                <MultiSelect
                  options={subjectsIncome}
                  selected={incomeSubjectFilters}
                  onChange={setIncomeSubjectFilters}
                  placeholder="All Subjects"
                />
              </div>
            </div>
          </div>
          <div className="text-center !mt-4 !mb-0">
            <h4 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              Total Income
              <RefreshCw 
                className="h-4 w-4 cursor-pointer hover:text-primary transition-colors" 
                onClick={refreshData}
              />
            </h4>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncomes)}</p>
            <div className="text-sm text-primary/50 flex items-center justify-center gap-1.5 flex-wrap">
              <InlineDatePicker date={dateFromFilter} setDate={setDateFromFilter} label={dateRangeParts.startPart} />
              <span>-</span>
              <InlineDatePicker date={dateToFilter} setDate={setDateToFilter} label={dateRangeParts.endPart} />
              {dateRangeParts.suffix && <span>{dateRangeParts.suffix}</span>}
              <span>•</span>
              <span>{filteredIncomes.length} Transactions</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-64 relative flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex-1 h-full relative">
                {incomesChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Pie
                          data={incomesChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={110}
                          innerRadius={55}
                          fill="#8884d8"
                          dataKey="value"
                          onClick={(entry) => handleCategoryClick(entry.name, 'incomes')}
                          className="cursor-pointer"
                        >
                          {incomesChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              opacity={selectedIncomeCategory ? (selectedIncomeCategory === entry.name ? 1 : 0.3) : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-lg font-bold text-green-600">{formatCurrency(totalIncomes)}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">No income data matches the selected filters.</p>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            {/* Custom Legend */}
            {incomesChartData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {incomesChartData.map((entry) => {
                  const percentage = ((entry.value / totalIncomes) * 100).toFixed(1);
                  const isSelected = selectedIncomeCategory === entry.name;
                  return (
                    <div
                      key={entry.name}
                      className={`flex items-center gap-2 text-xs cursor-pointer p-1 rounded transition-colors ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                      onClick={() => handleCategoryClick(entry.name, 'incomes')}
                    >
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className={isSelected ? 'font-bold' : ''}>{entry.name} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
            {renderDetailedTable('incomes')}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {/* <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncomes)}</p>
        </div>
      </div> */}
    </div>
  );
}
