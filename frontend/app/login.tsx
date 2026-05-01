import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

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
        }
    };

    const handleRegisterNavigation = () => {
        router.push('/register');
    };

    const [showPassword, setShowPassword] = useState(false);

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
                    <View className="flex-1 px-6 justify-evenly py-8">
                        {/* Header */}
                        <View className="mb-12 justify-center items-center">
                            <View>
                                <Image
                                    source={require('@/assets/images/logo.png')}
                                    style={{ width: 200, height: 100 }}
                                    resizeMode="contain"
                                    alt="Logo"
                                />
                            </View>

                            <Text className="text-zinc-400 text-base font-firs-regular max-w-xs text-center">
                                Acompanhe e documente seu progresso em tempo real.
                            </Text>
                        </View>

                        {/* Error Alert */}
                        {error ? (
                            <View className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                                <Text className="text-red-500 font-firs-medium">{error}</Text>
                            </View>
                        ) : null}

                        {/* Form */}
                        <View className="mb-56">
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
                                <View className="flex-row items-center bg-zinc-900 rounded-lg border border-zinc-800">
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#71717a"
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!isLoading}
                                        secureTextEntry={!showPassword}
                                        className="flex-1 text-white px-4 py-3 font-firs-regular"
                                    />

                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4"
                                    >
                                        <Feather
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color="#71717a"
                                        />
                                    </TouchableOpacity>
                                </View>
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
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
