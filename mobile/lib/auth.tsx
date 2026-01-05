import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Enable web browser redirect handling
WebBrowser.maybeCompleteAuthSession();

// Auth context type
interface AuthContextType {
    user: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

// Storage key for user data
const USER_STORAGE_KEY = 'finance_tracker_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Use Expo's standard Google Auth configuration
    // This automatically handles the proxy for Expo Go
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
    });

    // Check for stored user on mount
    useEffect(() => {
        checkStoredUser();
    }, []);

    // Handle OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleSignIn(response.authentication?.accessToken);
        }
    }, [response]);

    async function checkStoredUser() {
        try {
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error checking stored user:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn(accessToken: string | undefined) {
        if (!accessToken) return;

        try {
            setLoading(true);

            // Get user info from Google
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/userinfo/v2/me',
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const userInfo = await userInfoResponse.json();

            // Try to sign in with Supabase
            try {
                await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: accessToken,
                });
            } catch (error) {
                console.log('Supabase auth failed, using Google user info directly');
            }

            const userData = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.picture,
                accessToken,
            };

            // Store user
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error during Google sign in:', error);
        } finally {
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        try {
            console.log('Initiating Google Sign In...');
            const result = await promptAsync();
            console.log('Google Sign In Result:', JSON.stringify(result, null, 2));

            if (result?.type === 'error') {
                console.error('Google Sign In Error:', result.error);
                alert(`Sign in error: ${result.error?.message || 'Unknown error'}`);
            } else if (result?.type === 'success') {
                console.log('Sign in success, token:', result.authentication?.accessToken ? 'Present' : 'Missing');
            }
        } catch (error) {
            console.error('Error prompting Google sign in:', error);
            alert(`Sign in exception: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async function signOut() {
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
