import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import type { Workout } from '@/hooks/useWorkouts';
import {
    formatDateKey,
    getStoredDateKey,
    parseStoredDate,
    startOfLocalDay,
} from '@/utils/date';

interface StatisticsScreenProps {
    workouts?: Workout[];
    loading?: boolean;
}

function calculateStats(workouts: Workout[]) {
    if (workouts.length === 0) {
        return {
            totalWorkouts: 0,
            workoutsLast7Days: 0,
            workoutsLast30Days: 0,
            avgPerWeek: '0.0',
            streak: 0,
        };
    }

    const today = startOfLocalDay(new Date());
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const workoutsLast30Days = workouts.filter(
        (workout) => parseStoredDate(workout.date) >= thirtyDaysAgo
    ).length;

    const workoutsLast7Days = workouts.filter(
        (workout) => parseStoredDate(workout.date) >= sevenDaysAgo
    ).length;

    const workoutDays = new Set(
        workouts.map((workout) => getStoredDateKey(workout.date))
    );

    let streak = 0;
    const currentDate = new Date(today);

    while (workoutDays.has(formatDateKey(currentDate))) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
        totalWorkouts: workouts.length,
        workoutsLast7Days,
        workoutsLast30Days,
        avgPerWeek: (workoutsLast30Days / 4).toFixed(1),
        streak,
    };
}

function formatCompletionRate(count: number, days: number) {
    if (count === 0) {
        return '0%';
    }

    return `${Math.min(100, Math.round((count / days) * 100))}%`;
}

export default function StatisticsScreen({
    workouts = [],
    loading = false,
}: StatisticsScreenProps) {
    const stats = useMemo(() => calculateStats(workouts), [workouts]);

    if (loading && workouts.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#A6FF00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingVertical: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8">
                    <Text className="text-white font-firs-bold text-2xl mb-2">
                        Suas Estatísticas
                    </Text>
                    <Text className="text-zinc-400 font-firs-regular text-sm">
                        Acompanhe seu progresso de treinos
                    </Text>
                </View>

                <View className="gap-4 mb-6">
                    <View className="bg-surface-elevated rounded-[24px] p-6 border border-zinc-800">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                    Total de Treinos
                                </Text>
                                <Text className="text-white font-firs-bold text-4xl">
                                    {stats.totalWorkouts}
                                </Text>
                            </View>
                            <View className="bg-brand-primary/10 rounded-full p-3">
                                <MaterialCommunityIcons
                                    name="dumbbell"
                                    size={24}
                                    color="#A6FF00"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="bg-surface-elevated rounded-[24px] p-6 border border-zinc-800">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                    Sequência Atual
                                </Text>
                                <View className="flex-row items-baseline gap-2">
                                    <Text className="text-white font-firs-bold text-4xl">
                                        {stats.streak}
                                    </Text>
                                    <Text className="text-zinc-400 font-firs-regular">
                                        dias seguidos
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-yellow-500/10 rounded-full p-3">
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={24}
                                    color="#FFA500"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <Text className="text-white font-firs-bold text-lg mb-4">
                    Últimos Períodos
                </Text>

                <View className="gap-3 mb-6">
                    <View className="bg-zinc-800/50 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-brand-primary/20 rounded-lg p-2">
                                <Feather name="calendar" size={16} color="#A6FF00" />
                            </View>
                            <View>
                                <Text className="text-zinc-400 font-firs-regular text-sm">
                                    Últimos 7 dias
                                </Text>
                                <Text className="text-white font-firs-bold text-lg">
                                    {stats.workoutsLast7Days} treinos
                                </Text>
                            </View>
                        </View>
                        <Text className="text-brand-success font-firs-bold">
                            {formatCompletionRate(stats.workoutsLast7Days, 7)}
                        </Text>
                    </View>

                    <View className="bg-zinc-800/50 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-brand-primary/20 rounded-lg p-2">
                                <Feather name="calendar" size={16} color="#A6FF00" />
                            </View>
                            <View>
                                <Text className="text-zinc-400 font-firs-regular text-sm">
                                    Últimos 30 dias
                                </Text>
                                <Text className="text-white font-firs-bold text-lg">
                                    {stats.workoutsLast30Days} treinos
                                </Text>
                            </View>
                        </View>
                        <Text className="text-brand-success font-firs-bold">
                            {formatCompletionRate(stats.workoutsLast30Days, 30)}
                        </Text>
                    </View>

                    <View className="bg-zinc-800/50 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-brand-primary/20 rounded-lg p-2">
                                <MaterialCommunityIcons
                                    name="chart-line"
                                    size={16}
                                    color="#A6FF00"
                                />
                            </View>
                            <View>
                                <Text className="text-zinc-400 font-firs-regular text-sm">
                                    Média por semana
                                </Text>
                                <Text className="text-white font-firs-bold text-lg">
                                    {stats.avgPerWeek} treinos
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View>
                    <Text className="text-white font-firs-bold text-lg mb-4">
                        Dicas
                    </Text>

                    {stats.streak >= 7 ? (
                        <View className="bg-green-500/10 border border-green-600 rounded-lg p-4">
                            <View className="flex-row gap-3">
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#10b981"
                                />
                                <View className="flex-1">
                                    <Text className="text-green-600 font-firs-bold text-sm mb-1">
                                        Parabéns!
                                    </Text>
                                    <Text className="text-green-600 font-firs-regular text-xs">
                                        Você tem {stats.streak} dias seguidos de treino. Mantenha
                                        esse ritmo!
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="bg-blue-500/10 border border-blue-600 rounded-lg p-4">
                            <View className="flex-row gap-3">
                                <MaterialCommunityIcons
                                    name="lightbulb-on"
                                    size={20}
                                    color="#3b82f6"
                                />
                                <View className="flex-1">
                                    <Text className="text-blue-600 font-firs-bold text-sm mb-1">
                                        Mantenha a consistência
                                    </Text>
                                    <Text className="text-blue-600 font-firs-regular text-xs">
                                        Treinos regulares são a chave para o progresso. Tente
                                        atingir 4-5 treinos por semana.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
