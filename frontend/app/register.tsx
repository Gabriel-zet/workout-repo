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
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter no mínimo 8 caracteres');
            return;
        }

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            setError('A senha precisa ter maiúscula, minúscula e número');
            return;
        }

        try {
            await signUp(name, email, password, confirmPassword);
            // Navegação é automática após signup no contexto
        } catch (err: any) {
            const errorMessage =
                err.message || err.issues?.[0]?.message || 'Erro ao criar conta';
            setError(errorMessage);
            Alert.alert('Erro no Registro', errorMessage);
        }
    };

    const handleBackToLogin = () => {
        router.back();
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
                        {/* Header com botão voltar */}
                        <View className="flex-row items-center mb-8">
                            <TouchableOpacity
                                onPress={handleBackToLogin}
                                disabled={isLoading}
                            >
                                <Feather name="arrow-left" size={24} color="white" />
                            </TouchableOpacity>
                            <View className="ml-4 flex-1">
                                <Text className="text-white text-3xl font-bold font-firs-black">
                                    Nova Conta
                                </Text>
                                <Text className="text-zinc-400 text-sm font-firs-regular mt-1">
                                    Comece seu progresso
                                </Text>
                            </View>
                        </View>

                        {/* Error Alert */}
                        {error ? (
                            <View className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                                <Text className="text-red-500 font-firs-medium">{error}</Text>
                            </View>
                        ) : null}

                        {/* Name Input */}
                        <View className="mb-6">
                            <Text className="text-white text-sm font-firs-medium mb-3">
                                Nome Completo
                            </Text>
                            <TextInput
                                placeholder="João Silva"
                                placeholderTextColor="#71717a"
                                value={name}
                                onChangeText={setName}
                                editable={!isLoading}
                                className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular border border-zinc-800"
                            />
                        </View>

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
                        <View className="mb-6">
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
                            <Text className="text-zinc-500 text-xs font-firs-regular mt-2">
                                Mínimo 8 caracteres com maiúscula, minúscula e número
                            </Text>
                        </View>

                        {/* Confirm Password Input */}
                        <View className="mb-8">
                            <Text className="text-white text-sm font-firs-medium mb-3">
                                Confirmar Senha
                            </Text>
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#71717a"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                editable={!isLoading}
                                secureTextEntry
                                className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular border border-zinc-800"
                            />
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
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
                                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-zinc-400 font-firs-regular">
                                Já tem conta?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
                                <Text className="text-orange-500 font-firs-bold">
                                    Entrar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
