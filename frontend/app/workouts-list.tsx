import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useWorkouts } from '@/hooks/useWorkouts';
import theme from '@/constants/theme';
import { formatWeeklySchedule } from '@/utils/date';

export default function WorkoutsListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { workouts, loading, deleteWorkout, refetch } = useWorkouts();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch({ force: true });
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
            <SafeAreaView
                className="flex-1 items-center justify-center bg-canvas"
                edges={['left', 'right', 'bottom']}
            >
                <ActivityIndicator size="large" color={theme.colors.brand} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right', 'bottom']}>
            <View className="px-6 pb-5" style={{ paddingTop: insets.top + 12 }}>
                <View className="mb-8 flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full border border-outline-subtle bg-surface-elevated"
                    >
                        <Feather name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>

                    <Text className="text-[20px] font-firs-bold text-foreground">
                        Meus treinos
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/create-workout')}
                        className="h-11 w-11 items-center justify-center rounded-full border border-outline-subtle bg-surface-elevated"
                    >
                        <Feather name="plus" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="overflow-hidden rounded-[28px] border border-outline-subtle bg-surface-soft px-5 py-5">
                    <View className="flex-row items-end justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="mb-2 text-[13px] font-firs-regular text-foreground-muted">
                                Total de treinos
                            </Text>
                            <Text className="text-[42px] font-firs-bold leading-[46px] tracking-tight text-foreground">
                                {workouts.length}
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="mb-2 text-[12px] font-firs-medium text-foreground-muted">
                                Sequência atual
                            </Text>
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={16}
                                    color={theme.colors.brand}
                                />
                                <Text className="ml-2 text-[18px] font-firs-bold text-foreground">
                                    {workouts.length} dias
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {workouts.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6 pb-10">
                    <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
                        <MaterialCommunityIcons
                            name="dumbbell"
                            size={32}
                            color={theme.colors.textSubtle}
                        />
                    </View>

                    <Text className="mb-2 text-[20px] font-firs-bold text-foreground">
                        Nenhum treino salvo
                    </Text>

                    <Text className="mb-8 text-center text-[14px] font-firs-regular leading-5 text-foreground-muted">
                        Crie seu primeiro treino para começar a organizar sua rotina.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/create-workout')}
                        className="rounded-[22px] border border-outline-subtle bg-surface-elevated px-5 py-4"
                    >
                        <Text className="text-[15px] font-firs-medium text-foreground">
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
                            tintColor={theme.colors.brand}
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
                                className="overflow-hidden rounded-[28px] border border-outline-subtle bg-surface"
                            >
                                <View className="px-5 py-5">
                                    <View className="mb-5 flex-row items-start justify-between">
                                        <View className="flex-1 pr-3">
                                            <Text
                                                numberOfLines={1}
                                                className="text-[24px] font-firs-bold tracking-tight text-foreground"
                                            >
                                                {item.title}
                                            </Text>

                                            {item.notes ? (
                                                <Text
                                                    numberOfLines={2}
                                                    className="mt-2 text-[13px] leading-5 text-foreground-muted"
                                                >
                                                    {item.notes}
                                                </Text>
                                            ) : (
                                                <Text className="mt-2 text-[13px] text-foreground-subtle">
                                                    Toque para ver os detalhes do treino
                                                </Text>
                                            )}
                                        </View>

                                        <View className="rounded-full border border-outline-subtle bg-surface-muted px-3 py-2">
                                            <Text className="text-[11px] font-firs-medium text-foreground-soft">
                                                {dateStr}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="mb-5 flex-row items-end justify-between">
                                        <View>
                                            <Text className="mb-1 text-[11px] font-firs-medium uppercase tracking-wide text-foreground-subtle">
                                                Exercícios
                                            </Text>
                                            <Text className="text-[38px] font-firs-bold leading-none text-foreground">
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

                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => handleEditWorkout(item.id)}
                                            className="mr-2 h-12 w-12 items-center justify-center rounded-2xl border border-outline-subtle bg-surface-muted"
                                        >
                                            <Feather
                                                name="edit-2"
                                                size={16}
                                                color={theme.colors.textMuted}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => handleDeleteWorkout(item.id, item.title)}
                                            className="h-12 w-12 items-center justify-center rounded-2xl border border-outline-subtle bg-danger-soft"
                                        >
                                            <Feather
                                                name="trash-2"
                                                size={16}
                                                color={theme.colors.danger}
                                            />
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

