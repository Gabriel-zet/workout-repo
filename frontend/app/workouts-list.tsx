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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWorkouts } from '@/hooks/useWorkouts';
import { formatWeeklySchedule } from '@/utils/date';

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
                'Excluir treino',
                `Tem certeza que deseja excluir "${title}"?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteWorkout(id);
                            } catch (error) {
                                console.error('Delete workout failed:', error);
                                Alert.alert('Erro', 'Falha ao excluir treino');
                            }
                        },
                    },
                ]
            );
        },
        [deleteWorkout]
    );

    const handleEditWorkout = useCallback(
        (id: string) => {
            router.push({
                pathname: '/create-workout',
                params: { id },
            });
        },
        [router]
    );

    const handleOpenWorkout = useCallback(
        (id: string) => {
            router.push({
                pathname: '/workout-detail',
                params: { id },
            });
        },
        [router]
    );

    if (loading && workouts.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#FF6800" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <View className="px-6 pt-4 pb-5">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-full bg-[#141416] items-center justify-center"
                    >
                        <Feather name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>

                    <Text className="text-white text-[20px] font-firs-bold">
                        Meus treinos
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/create-workout')}
                        className="w-11 h-11 rounded-full bg-[#141416] items-center justify-center"
                    >
                        <Feather name="plus" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="overflow-hidden">
                    <View className="flex-row items-end justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-zinc-500 text-[13px] font-firs-regular mb-2">
                                Total de treinos
                            </Text>
                            <Text className="text-white text-[42px] leading-[46px] font-firs-bold tracking-tight">
                                {workouts.length}
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="text-zinc-500 text-[12px] font-firs-medium mb-2">
                                Sequência atual
                            </Text>
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={16}
                                    color="#FF6800"
                                />
                                <Text className="text-white text-[18px] font-firs-bold ml-2">
                                    {workouts.length} dias
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {workouts.length === 0 ? (
                <View className="flex-1 px-6 pb-10 items-center justify-center">
                    <View className="w-20 h-20 rounded-full bg-[#141416] items-center justify-center mb-5">
                        <MaterialCommunityIcons
                            name="dumbbell"
                            size={32}
                            color="#71717a"
                        />
                    </View>

                    <Text className="text-white text-[20px] font-firs-bold mb-2">
                        Nenhum treino salvo
                    </Text>

                    <Text className="text-zinc-500 text-[14px] text-center leading-5 font-firs-regular mb-8">
                        Crie seu primeiro treino para começar a organizar sua rotina.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/create-workout')}
                        className="bg-[#141416] rounded-[22px] px-5 py-4"
                    >
                        <Text className="text-white text-[15px] font-firs-medium">
                            Criar treino
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 4,
                        paddingBottom: 96,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FF6800"
                        />
                    }
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    renderItem={({ item }) => {
                        const dateStr = formatWeeklySchedule(item.date);
                        const exerciseCount = item.workoutExercises?.length || 0;

                        return (
                            <TouchableOpacity
                                activeOpacity={0.92}
                                onPress={() => handleOpenWorkout(item.id)}
                                className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111114]/85"
                            >
                                <View className="px-5 py-5">
                                    {/* Header */}
                                    <View className="mb-5 flex-row items-start justify-between">
                                        <View className="flex-1 pr-3">

                                            <Text
                                                numberOfLines={1}
                                                className="text-[24px] font-firs-bold tracking-tight text-white"
                                            >
                                                {item.title}
                                            </Text>

                                            {item.notes ? (
                                                <Text
                                                    numberOfLines={2}
                                                    className="mt-2 text-[13px] leading-5 text-zinc-400"
                                                >
                                                    {item.notes}
                                                </Text>
                                            ) : (
                                                <Text className="mt-2 text-[13px] text-zinc-500">
                                                    Toque para ver os detalhes do treino
                                                </Text>
                                            )}
                                        </View>

                                        <View className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                            <Text className="text-[11px] font-firs-medium text-zinc-300">
                                                {dateStr}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Main metric */}
                                    <View className="mb-5 flex-row items-end justify-between">
                                        <View>
                                            <Text className="mb-1 text-[11px] font-firs-medium uppercase tracking-wide text-zinc-500">
                                                Exercícios
                                            </Text>
                                            <Text className="text-[38px] font-firs-bold leading-none text-white">
                                                {exerciseCount}
                                            </Text>
                                        </View>

                                        <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
                                            <View className="flex-row items-center">
                                                <View className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
                                                <Text className="text-[11px] font-firs-bold uppercase tracking-wide text-emerald-300">
                                                    Salvo
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Footer */}
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => handleEditWorkout(item.id)}
                                            className="mr-2 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                                        >
                                            <Feather name="edit-2" size={16} color="#a1a1aa" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => handleDeleteWorkout(item.id, item.title)}
                                            className="h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10"
                                        >
                                            <Feather name="trash-2" size={16} color="#f87171" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}