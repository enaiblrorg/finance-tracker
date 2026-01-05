import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import {
    Category,
    DEFAULT_EXPENSE_CATEGORIES,
    DEFAULT_INCOME_CATEGORIES,
} from '@/lib/types';
import { submitExpense, submitIncome } from '@/lib/api';
import { evaluateMathExpression, formatCurrency } from '@/lib/utils';

export default function AddTransactionScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Form state
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState<number | null>(null);
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Categories based on type
    const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

    // Set default category when type changes
    useEffect(() => {
        if (categories.length > 0 && !categories.find(c => c.value === category)) {
            setCategory(categories[0].value);
        }
    }, [type, categories, category]);

    // Evaluate math expression
    useEffect(() => {
        if (amount) {
            const result = evaluateMathExpression(amount);
            setDisplayAmount(result);
        } else {
            setDisplayAmount(null);
        }
    }, [amount]);

    // Handle submit
    const handleSubmit = async () => {
        if (!displayAmount || displayAmount <= 0) {
            Alert.alert('Error', 'Masukkan jumlah yang valid');
            return;
        }
        if (!category) {
            Alert.alert('Error', 'Pilih kategori');
            return;
        }

        setLoading(true);
        try {
            const data = {
                amount: displayAmount,
                category,
                date,
                description: note,
            };

            const result = type === 'expense'
                ? await submitExpense(data as any)
                : await submitIncome(data as any);

            if (result) {
                Alert.alert('Berhasil', `${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} berhasil disimpan`);
                // Reset form
                setAmount('');
                setNote('');
                setDisplayAmount(null);
            } else {
                Alert.alert('Error', 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    // Get icon for category
    const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            'restaurant': 'restaurant',
            'ice-cream': 'ice-cream',
            'cart': 'cart',
            'car': 'car',
            'school': 'school',
            'film': 'film',
            'gift': 'gift',
            'people': 'people',
            'medkit': 'medkit',
            'document': 'document',
            'cash': 'cash',
            'bag': 'bag',
            'trending-up': 'trending-up',
            'home': 'home',
            'ellipsis-horizontal': 'ellipsis-horizontal',
            'wallet': 'wallet',
            'calendar': 'calendar',
            'briefcase': 'briefcase',
        };
        return iconMap[iconName] || 'ellipsis-horizontal';
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#F3F4F6',
        },
        form: {
            padding: 16,
        },
        typeToggle: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
        },
        typeButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            alignItems: 'center',
        },
        typeButtonActive: {
            backgroundColor: isDark ? '#6366F1' : '#FFFFFF',
        },
        typeButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#9CA3AF' : '#6B7280',
        },
        typeButtonTextActive: {
            color: isDark ? '#FFFFFF' : '#6366F1',
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#D1D5DB' : '#374151',
            marginBottom: 8,
        },
        amountInput: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            fontSize: 24,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
            textAlign: 'center',
            borderWidth: 2,
            borderColor: isDark ? '#374151' : '#E5E7EB',
        },
        amountDisplay: {
            textAlign: 'center',
            marginTop: 8,
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#6B7280',
        },
        amountDisplayValue: {
            color: type === 'expense' ? '#EF4444' : '#10B981',
            fontWeight: '600',
        },
        categoriesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        categoryButton: {
            width: '31%',
            aspectRatio: 1.2,
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isDark ? '#374151' : '#E5E7EB',
        },
        categoryButtonActive: {
            borderColor: '#6366F1',
            backgroundColor: isDark ? '#312E81' : '#EEF2FF',
        },
        categoryIcon: {
            marginBottom: 4,
        },
        categoryText: {
            fontSize: 10,
            textAlign: 'center',
            color: isDark ? '#D1D5DB' : '#374151',
        },
        categoryTextActive: {
            color: '#6366F1',
            fontWeight: '600',
        },
        noteInput: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDark ? '#F9FAFB' : '#111827',
            borderWidth: 2,
            borderColor: isDark ? '#374151' : '#E5E7EB',
            minHeight: 80,
            textAlignVertical: 'top',
        },
        dateInput: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDark ? '#F9FAFB' : '#111827',
            borderWidth: 2,
            borderColor: isDark ? '#374151' : '#E5E7EB',
        },
        submitButton: {
            backgroundColor: type === 'expense' ? '#EF4444' : '#10B981',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        submitButtonText: {
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.container}>
                <View style={styles.form}>
                    {/* Type Toggle */}
                    <View style={styles.typeToggle}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                            onPress={() => setType('expense')}>
                            <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                                Pengeluaran
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                            onPress={() => setType('income')}>
                            <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                                Pemasukan
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Jumlah (Rp)</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            keyboardType="numeric"
                        />
                        {displayAmount !== null && (
                            <Text style={styles.amountDisplay}>
                                = <Text style={styles.amountDisplayValue}>{formatCurrency(displayAmount)}</Text>
                            </Text>
                        )}
                    </View>

                    {/* Category Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.categoryButton,
                                        category === cat.value && styles.categoryButtonActive,
                                    ]}
                                    onPress={() => setCategory(cat.value)}>
                                    <Ionicons
                                        name={getIconName(cat.icon)}
                                        size={24}
                                        color={category === cat.value ? '#6366F1' : (isDark ? '#9CA3AF' : '#6B7280')}
                                        style={styles.categoryIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            category === cat.value && styles.categoryTextActive,
                                        ]}
                                        numberOfLines={1}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Date Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tanggal</Text>
                        <TextInput
                            style={styles.dateInput}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        />
                    </View>

                    {/* Note Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Catatan (Opsional)</Text>
                        <TextInput
                            style={styles.noteInput}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Tambahkan catatan..."
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            multiline
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Simpan {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
