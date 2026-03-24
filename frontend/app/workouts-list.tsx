import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWorkouts } from '@/hooks/useWorkouts';
import { parseStoredDate } from '@/utils/date';

export default function WorkoutsListScreen() {
    const router = useRouter();
    const { workouts, loading, deleteWorkout, refetch } = useWorkouts();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDeleteWorkout = useCallback(
        (id: string, title: string) => {
            Alert.alert(
                'Deletar Treino',
                `Tem certeza que deseja deletar "${title}"?`,
                [
                    { text: 'Cancelar', onPress: () => { }, style: 'cancel' },
                    {
                        text: 'Deletar',
                        onPress: async () => {
                            try {
                                await deleteWorkout(id);
                                Alert.alert('Sucesso', 'Treino deletado com sucesso');
                            } catch (error) {
                                console.error('Delete workout failed:', error);
                                Alert.alert('Erro', 'Falha ao deletar treino');
                            }
                        },
                        style: 'destructive',
                    },
                ]
            );
        },
        [deleteWorkout]
    );

    const handleEditWorkout = (id: string) => {
        router.push({
            pathname: '/create-workout',
            params: { id },
        });
    };

    if (loading && workouts.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#A6FF00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <View className="px-4 py-4 border-b border-zinc-800">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white font-firs-bold text-2xl">
                            Meus Treinos
                        </Text>
                        <Text className="text-zinc-400 font-firs-regular text-sm">
                            {workouts.length} treino{workouts.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="bg-brand-primary rounded-full w-12 h-12 items-center justify-center"
                        onPress={() => router.push('/create-workout')}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#09090b" />
                    </TouchableOpacity>
                </View>
            </View>

            {workouts.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <MaterialCommunityIcons
                        name="dumbbell"
                        size={64}
                        color="#71717a"
                        style={{ marginBottom: 16 }}
                    />
                    <Text className="text-white font-firs-bold text-lg mb-2">
                        Nenhum Treino Ainda
                    </Text>
                    <Text className="text-zinc-400 font-firs-regular text-center mb-6">
                        Crie seu primeiro treino para começar a acompanhar seu progresso
                    </Text>
                    <TouchableOpacity
                        className="bg-brand-primary px-6 py-3 rounded-lg"
                        onPress={() => router.push('/create-workout')}
                    >
                        <Text className="text-zinc-900 font-firs-bold">
                            Criar Primeiro Treino
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const date = parseStoredDate(item.date);
                        const dateStr = date.toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                        });

                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => router.push({
                                    pathname: '/workout-detail',
                                    params: { id: item.id },
                                })}
                                className="mx-4 mb-3 bg-zinc-800 rounded-lg p-4"
                            >
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-1">
                                        <Text className="text-white font-firs-bold text-base mb-1">
                                            {item.title}
                                        </Text>
                                        <View className="flex-row items-center gap-2">
                                            <MaterialCommunityIcons
                                                name="calendar"
                                                size={14}
                                                color="#71717a"
                                            />
                                            <Text className="text-zinc-400 font-firs-regular text-xs">
                                                {dateStr}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            className="bg-brand-primary/20 rounded-lg px-3 py-2"
                                            onPress={() => handleEditWorkout(item.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name="pencil"
                                                size={16}
                                                color="#A6FF00"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-red-500/20 rounded-lg px-3 py-2"
                                            onPress={() =>
                                                handleDeleteWorkout(item.id, item.title)
                                            }
                                        >
                                            <MaterialCommunityIcons
                                                name="delete"
                                                size={16}
                                                color="#FF6B6B"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {item.notes && (
                                    <Text
                                        className="text-zinc-400 font-firs-regular text-xs mb-3"
                                        numberOfLines={2}
                                    >
                                        {item.notes}
                                    </Text>
                                )}

                                <View className="flex-row gap-3 pt-3 border-t border-zinc-700">
                                    <View className="flex-1">
                                        <Text className="text-zinc-500 font-firs-regular text-xs">
                                            Exercícios
                                        </Text>
                                        <Text className="text-white font-firs-bold">
                                            {item.workoutExercises?.length || 0}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-zinc-500 font-firs-regular text-xs">
                                            Status
                                        </Text>
                                        <View className="flex-row items-center gap-1">
                                            <View className="w-2 h-2 rounded-full bg-green-500" />
                                            <Text className="text-green-500 font-firs-bold text-sm">
                                                Salvo
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    contentContainerStyle={{
                        paddingVertical: 12,
                        paddingBottom: 80,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FF6800"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
