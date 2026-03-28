import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { apiClient } from '../services/api';

interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar autenticação ao carregar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            console.log('Checking auth...');
            const token = await storage.getItem('auth_token');
            console.log('Token found:', !!token);

            if (token) {
                // Verificar se token ainda é válido
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
            await storage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await apiClient.login(email, password);

            // Salvar token
            await apiClient.setToken(response.token);

            // Buscar dados do usuário
            const meData = await apiClient.getMe();
            setUser(meData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);

            // Registrar usuário
            await apiClient.register(name, email, password);

            // Fazer login automaticamente
            await signIn(email, password);
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
            await apiClient.removeToken();
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isSignedIn: user !== null,
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
