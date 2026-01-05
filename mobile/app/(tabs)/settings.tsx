import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { clearCache } from '@/lib/cache';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Handle sign out
    const handleSignOut = async () => {
        Alert.alert(
            'Keluar',
            'Yakin ingin keluar dari akun?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        await clearCache();
                        await supabase.auth.signOut();
                    },
                },
            ]
        );
    };

    // Handle clear cache
    const handleClearCache = async () => {
        await clearCache();
        Alert.alert('Berhasil', 'Cache berhasil dihapus');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#F3F4F6',
        },
        section: {
            marginTop: 24,
            marginHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 8,
            marginLeft: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        card: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            overflow: 'hidden',
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#374151' : '#F3F4F6',
        },
        itemLast: {
            borderBottomWidth: 0,
        },
        itemIcon: {
            width: 36,
            height: 36,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        itemContent: {
            flex: 1,
        },
        itemTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: isDark ? '#F9FAFB' : '#111827',
        },
        itemSubtitle: {
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginTop: 2,
        },
        itemChevron: {
            marginLeft: 8,
        },
        dangerItem: {
            justifyContent: 'center',
        },
        dangerText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#EF4444',
            textAlign: 'center',
        },
        version: {
            textAlign: 'center',
            color: isDark ? '#6B7280' : '#9CA3AF',
            marginTop: 24,
            marginBottom: 32,
            fontSize: 14,
        },
    });

    return (
        <ScrollView style={styles.container}>
            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Akun</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.item}>
                        <View style={[styles.itemIcon, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
                            <Ionicons name="person" size={20} color="#6366F1" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Profil</Text>
                            <Text style={styles.itemSubtitle}>Kelola informasi akun</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} style={styles.itemChevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item}>
                        <View style={[styles.itemIcon, { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }]}>
                            <Ionicons name="wallet" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Anggaran Bulanan</Text>
                            <Text style={styles.itemSubtitle}>Atur target pengeluaran</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} style={styles.itemChevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.item, styles.itemLast]}>
                        <View style={[styles.itemIcon, { backgroundColor: isDark ? '#065F46' : '#D1FAE5' }]}>
                            <Ionicons name="grid" size={20} color="#10B981" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Kategori</Text>
                            <Text style={styles.itemSubtitle}>Kelola kategori transaksi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} style={styles.itemChevron} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* App Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aplikasi</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.item} onPress={handleClearCache}>
                        <View style={[styles.itemIcon, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
                            <Ionicons name="trash" size={20} color="#EF4444" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Hapus Cache</Text>
                            <Text style={styles.itemSubtitle}>Bersihkan data sementara</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.item, styles.itemLast]}>
                        <View style={[styles.itemIcon, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                            <Ionicons name="information-circle" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Tentang</Text>
                            <Text style={styles.itemSubtitle}>Versi dan informasi aplikasi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} style={styles.itemChevron} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sign Out */}
            <View style={styles.section}>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={[styles.item, styles.itemLast, styles.dangerItem]}
                        onPress={handleSignOut}>
                        <Text style={styles.dangerText}>Keluar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.version}>Finance Tracker v1.0.0</Text>
        </ScrollView>
    );
}
