import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import {
    MaterialCommunityIcons,
    Feather,
    FontAwesome5,
} from '@expo/vector-icons';

export default function ExploreScreen() {
    const { user, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Sair da Conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', onPress: () => { } },
                {
                    text: 'Sair',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await signOut();
                        } catch (error) {
                            console.error('Logout failed:', error);
                            Alert.alert('Erro', 'Não foi possível sair');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <View className="px-6 py-8">
                    <Text className="text-white text-4xl font-firs-black mb-2">
                        Perfil
                    </Text>
                    <Text className="text-zinc-400 text-base font-firs-regular">
                        Gerencie sua conta
                    </Text>
                </View>

                <View className="px-6 mb-8">
                    <View className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 rounded-full bg-orange-600 items-center justify-center mb-4">
                                <FontAwesome5 name="user" size={40} color="white" />
                            </View>
                            <Text className="text-white text-2xl font-firs-bold">
                                {user?.name || 'Usuário'}
                            </Text>
                            <Text className="text-zinc-400 text-sm font-firs-regular">
                                {user?.email}
                            </Text>
                        </View>

                        <View className="bg-zinc-800 rounded-lg p-4 mb-4">
                            <View className="flex-row justify-between mb-3 pb-3 border-b border-zinc-700">
                                <Text className="text-zinc-400 font-firs-regular">
                                    ID do Usuário
                                </Text>
                                <Text className="text-white font-firs-medium">
                                    #{user?.id}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-zinc-400 font-firs-regular">
                                    Membro desde
                                </Text>
                                <Text className="text-white font-firs-medium text-sm">
                                    Março 2026
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-8">
                    <Text className="text-white text-lg font-firs-bold mb-4">
                        Ações
                    </Text>

                    <TouchableOpacity className="bg-zinc-900 rounded-xl p-4 mb-3 flex-row items-center justify-between border border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-lg bg-orange-600/10 items-center justify-center">
                                <Feather name="edit-2" size={18} color="#FF6800" />
                            </View>
                            <View>
                                <Text className="text-white font-firs-bold text-base">
                                    Editar Perfil
                                </Text>
                                <Text className="text-zinc-400 font-firs-regular text-xs">
                                    Atualize seus dados
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color="#71717a" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-zinc-900 rounded-xl p-4 mb-3 flex-row items-center justify-between border border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-lg bg-blue-600/10 items-center justify-center">
                                <Feather name="lock" size={18} color="#3b82f6" />
                            </View>
                            <View>
                                <Text className="text-white font-firs-bold text-base">
                                    Alterar Senha
                                </Text>
                                <Text className="text-zinc-400 font-firs-regular text-xs">
                                    Atualize sua senha
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color="#71717a" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-zinc-900 rounded-xl p-4 mb-3 flex-row items-center justify-between border border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-lg bg-purple-600/10 items-center justify-center">
                                <Feather name="settings" size={18} color="#a855f7" />
                            </View>
                            <View>
                                <Text className="text-white font-firs-bold text-base">
                                    Configurações
                                </Text>
                                <Text className="text-zinc-400 font-firs-regular text-xs">
                                    Preferências do app
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color="#71717a" />
                    </TouchableOpacity>
                </View>

                <View className="px-6 mb-8">
                    <Text className="text-white text-lg font-firs-bold mb-4">
                        Estatísticas
                    </Text>

                    <View className="flex-row flex-wrap -mx-2">
                        <View className="w-1/2 px-2 mb-4">
                            <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <MaterialCommunityIcons
                                        name="dumbbell"
                                        size={18}
                                        color="#FF6800"
                                    />
                                    <Text className="text-zinc-400 text-xs font-firs-regular">
                                        Treinos
                                    </Text>
                                </View>
                                <Text className="text-white text-2xl font-firs-bold">
                                    24
                                </Text>
                            </View>
                        </View>

                        <View className="w-1/2 px-2 mb-4">
                            <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <MaterialCommunityIcons
                                        name="calendar"
                                        size={18}
                                        color="#FF6800"
                                    />
                                    <Text className="text-zinc-400 text-xs font-firs-regular">
                                        Dias
                                    </Text>
                                </View>
                                <Text className="text-white text-2xl font-firs-bold">
                                    120
                                </Text>
                            </View>
                        </View>

                        <View className="w-1/2 px-2 mb-4">
                            <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <MaterialCommunityIcons
                                        name="chart-line"
                                        size={18}
                                        color="#FF6800"
                                    />
                                    <Text className="text-zinc-400 text-xs font-firs-regular">
                                        Média/Sem
                                    </Text>
                                </View>
                                <Text className="text-white text-2xl font-firs-bold">
                                    3.5
                                </Text>
                            </View>
                        </View>

                        <View className="w-1/2 px-2 mb-4">
                            <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <MaterialCommunityIcons
                                        name="fire"
                                        size={18}
                                        color="#FF6800"
                                    />
                                    <Text className="text-zinc-400 text-xs font-firs-regular">
                                        Série
                                    </Text>
                                </View>
                                <Text className="text-orange-500 text-2xl font-firs-bold">
                                    7
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isLoading}
                        className={`${isLoading ? 'bg-red-600/50' : 'bg-red-600'
                            } rounded-xl py-3.5 flex-row items-center justify-center gap-2`}
                    >
                        {isLoading && (
                            <ActivityIndicator color="white" size="small" />
                        )}
                        <Feather name="log-out" size={18} color="white" />
                        <Text className={`${isLoading ? 'ml-2' : ''} text-white font-firs-bold text-base`}>
                            {isLoading ? 'Saindo...' : 'Sair da Conta'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
