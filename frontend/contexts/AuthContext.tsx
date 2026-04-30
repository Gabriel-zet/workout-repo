import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

interface User {
    id: number;
    email: string;
    name: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    createdAt: Date | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            console.log('Checking auth...');
            const [token, refreshToken] = await Promise.all([
                apiClient.getToken(),
                apiClient.getRefreshToken(),
            ]);
            console.log('Token found:', !!token || !!refreshToken);

            if (token || refreshToken) {
                console.log('Validating token...');
                const meData = await apiClient.getMe();
                console.log('User data:', meData);
                setUser(meData);
            } else {
                console.log('No token found');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            await apiClient.clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await apiClient.login(email, password);

            await apiClient.setTokens(response);

            const meData = await apiClient.getMe();
            setUser(meData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ) => {
        try {
            setIsLoading(true);

            const response = await apiClient.register(
                name,
                email,
                password,
                confirmPassword
            );

            await apiClient.setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
            });

            const meData = await apiClient.getMe();
            setUser(meData);
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            await apiClient.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            await apiClient.clearTokens();
            setUser(null);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isSignedIn: user !== null,
                createdAt: user?.createdAt ? new Date(user.createdAt) : null,
                signIn,
                signUp,
                signOut,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
