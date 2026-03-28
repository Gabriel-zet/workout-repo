import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Preencha e-mail e senha');
            return;
        }

        try {
            await signIn(email, password);
            // Navegação é automática após login no contexto
        } catch (err: any) {
            const errorMessage = err.message || err.issues?.[0]?.message || 'Erro ao fazer login';
            setError(errorMessage);
            Alert.alert('Erro de Login', errorMessage);
        }
    };

    const handleRegisterNavigation = () => {
        router.push('/register');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 px-6 justify-center py-8">
                        {/* Header */}
                        <View className="mb-12">
                            <Text className="text-white text-4xl font-bold font-firs-black mb-2">
                                Treino+
                            </Text>
                            <Text className="text-zinc-400 text-base font-firs-regular">
                                Acompanhe seu progresso
                            </Text>
                        </View>

                        {/* Error Alert */}
                        {error ? (
                            <View className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                                <Text className="text-red-500 font-firs-medium">{error}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <View className="mb-6">
                            <Text className="text-white text-sm font-firs-medium mb-3">
                                E-mail
                            </Text>
                            <TextInput
                                placeholder="seu@email.com"
                                placeholderTextColor="#71717a"
                                value={email}
                                onChangeText={setEmail}
                                editable={!isLoading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular border border-zinc-800"
                            />
                        </View>

                        {/* Password Input */}
                        <View className="mb-8">
                            <Text className="text-white text-sm font-firs-medium mb-3">
                                Senha
                            </Text>
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#71717a"
                                value={password}
                                onChangeText={setPassword}
                                editable={!isLoading}
                                secureTextEntry
                                className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular border border-zinc-800"
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className={`${isLoading ? 'bg-orange-600/50' : 'bg-orange-600'
                                } rounded-lg py-3 mb-4`}
                        >
                            <View className="flex-row justify-center items-center">
                                {isLoading && (
                                    <ActivityIndicator color="white" size="small" />
                                )}
                                <Text
                                    className={`${isLoading ? 'ml-2' : ''
                                        } text-white text-base font-firs-bold`}
                                >
                                    {isLoading ? 'Entrando...' : 'Entrar'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Signup Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-zinc-400 font-firs-regular">
                                Não tem conta?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleRegisterNavigation} disabled={isLoading}>
                                <Text className="text-orange-500 font-firs-bold">
                                    Crie uma
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Demo Credentials Hint */}
                        <View className="mt-12 pt-8 border-t border-zinc-800">
                            <Text className="text-zinc-500 text-xs text-center font-firs-regular mb-3">
                                Para testes, você pode usar:
                            </Text>
                            <View className="bg-zinc-900 rounded-lg p-4">
                                <Text className="text-zinc-300 text-sm font-firs-medium mb-1">
                                    E-mail: teste@email.com
                                </Text>
                                <Text className="text-zinc-300 text-sm font-firs-medium">
                                    Senha: senha123
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
