import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { signInWithGoogle, loading } = useAuth();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        logo: {
            width: 100,
            height: 100,
            marginBottom: 24,
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            marginBottom: 48,
        },
        googleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        googleIcon: {
            width: 24,
            height: 24,
            marginRight: 12,
        },
        googleButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
        },
        skipButton: {
            marginTop: 24,
            padding: 12,
        },
        skipText: {
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#6B7280',
        },
        features: {
            position: 'absolute',
            bottom: 48,
            left: 24,
            right: 24,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        featureIcon: {
            marginRight: 12,
        },
        featureText: {
            fontSize: 14,
            color: isDark ? '#D1D5DB' : '#4B5563',
        },
    });

    return (
        <View style={styles.container}>
            {/* App Icon */}
            <View style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                backgroundColor: '#6366F1',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
            }}>
                <Ionicons name="wallet" size={48} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Finance Tracker</Text>
            <Text style={styles.subtitle}>
                Kelola keuangan dengan mudah{'\n'}dan pantau pengeluaranmu
            </Text>

            {/* Google Sign In Button */}
            <TouchableOpacity
                style={styles.googleButton}
                onPress={signInWithGoogle}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#6366F1" />
                ) : (
                    <>
                        <Image
                            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Features */}
            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <Ionicons name="pie-chart" size={20} color="#6366F1" style={styles.featureIcon} />
                    <Text style={styles.featureText}>Visualisasi pengeluaran dengan grafik</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="sync" size={20} color="#6366F1" style={styles.featureIcon} />
                    <Text style={styles.featureText}>Sinkronisasi dengan Google Sheets</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="shield-checkmark" size={20} color="#6366F1" style={styles.featureIcon} />
                    <Text style={styles.featureText}>Data aman dengan enkripsi</Text>
                </View>
            </View>
        </View>
    );
}
