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

function StatMiniCard({
    icon,
    label,
    value,
    badge,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    badge?: string;
}) {
    return (
        <View className="bg-[#141416] rounded-[24px] p-4 border border-white/5">
            <View className="flex-row items-center justify-between mb-5">
                <View className="w-10 h-10 rounded-2xl bg-[#1c1c20] items-center justify-center">
                    {icon}
                </View>
                {badge ? (
                    <Text className="text-zinc-500 text-[12px] font-firs-medium">
                        {badge}
                    </Text>
                ) : null}
            </View>

            <Text className="text-zinc-500 text-[13px] font-firs-regular mb-1">
                {label}
            </Text>
            <Text className="text-white text-[24px] font-firs-bold tracking-tight">
                {value}
            </Text>
        </View>
    );
}

function PeriodRow({
    icon,
    title,
    subtitle,
    value,
    first = false,
    last = false,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: string;
    first?: boolean;
    last?: boolean;
}) {
    return (
        <View
            className={`bg-[#141416] px-4 py-4 ${first ? 'rounded-t-[22px]' : ''
                } ${last ? 'rounded-b-[22px]' : ''}`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-2xl bg-[#1c1c20] items-center justify-center mr-3">
                        {icon}
                    </View>

                    <View className="flex-1">
                        <Text className="text-white text-[15px] font-firs-medium">
                            {title}
                        </Text>
                        <Text className="text-zinc-500 text-[13px] mt-1 font-firs-regular">
                            {subtitle}
                        </Text>
                    </View>
                </View>

                <Text className="text-white text-[15px] font-firs-bold">{value}</Text>
            </View>
        </View>
    );
}

export default function StatisticsScreen({
    workouts = [],
    loading = false,
}: StatisticsScreenProps) {
    const stats = useMemo(() => calculateStats(workouts), [workouts]);

    if (loading && workouts.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#FF6800" />
            </SafeAreaView>
        );
    }

    const completion7 = formatCompletionRate(stats.workoutsLast7Days, 7);
    const completion30 = formatCompletionRate(stats.workoutsLast30Days, 30);

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="px-6 pt-6 pb-7">
                    <Text className="text-white text-[32px] font-firs-black tracking-tight">
                        Estatísticas
                    </Text>
                    <Text className="text-zinc-500 text-[14px] mt-1 font-firs-regular">
                        Seu progresso de treino em uma visão mais clara
                    </Text>
                </View>

                <View className="px-6 mb-8">
                    <View className="overflow-hidden">
                        <View className="flex-row items-end justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-zinc-500 text-[13px] font-firs-regular mb-2">
                                    Total de treinos
                                </Text>
                                <Text className="text-white text-[42px] leading-[46px] font-firs-bold tracking-tight">
                                    {stats.totalWorkouts}
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
                                        {stats.streak} dias
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-8">
                    <Text className="text-white text-[18px] font-firs-bold mb-4">
                        Indicadores
                    </Text>

                    <View className="flex-row flex-wrap -mx-2">
                        <View className="w-1/2 px-2 mb-4">
                            <StatMiniCard
                                icon={<Feather name="calendar" size={18} color="#fff" />}
                                label="Últimos 7 dias"
                                value={`${stats.workoutsLast7Days}`}
                                badge={completion7}
                            />
                        </View>

                        <View className="w-1/2 px-2 mb-4">
                            <StatMiniCard
                                icon={<Feather name="calendar" size={18} color="#fff" />}
                                label="Últimos 30 dias"
                                value={`${stats.workoutsLast30Days}`}
                                badge={completion30}
                            />
                        </View>

                        <View className="w-1/2 px-2">
                            <StatMiniCard
                                icon={
                                    <MaterialCommunityIcons
                                        name="chart-line"
                                        size={18}
                                        color="#fff"
                                    />
                                }
                                label="Média por semana"
                                value={stats.avgPerWeek}
                            />
                        </View>

                        <View className="w-1/2 px-2">
                            <StatMiniCard
                                icon={
                                    <MaterialCommunityIcons
                                        name="fire"
                                        size={18}
                                        color="#fff"
                                    />
                                }
                                label="Sequência"
                                value={`${stats.streak}`}
                            />
                        </View>
                    </View>
                </View>

                <View className="px-6 mb-8">
                    <Text className="text-white text-[18px] font-firs-bold mb-4">
                        Períodos
                    </Text>

                    <View className="overflow-hidden rounded-[22px] border border-white/5">
                        <PeriodRow
                            first
                            icon={<Feather name="activity" size={17} color="#fff" />}
                            title="Últimos 7 dias"
                            subtitle={`${stats.workoutsLast7Days} treinos registrados`}
                            value={completion7}
                        />

                        <View className="h-px bg-[#232326]" />

                        <PeriodRow
                            icon={<Feather name="bar-chart-2" size={17} color="#fff" />}
                            title="Últimos 30 dias"
                            subtitle={`${stats.workoutsLast30Days} treinos registrados`}
                            value={completion30}
                        />

                        <View className="h-px bg-[#232326]" />

                        <PeriodRow
                            last
                            icon={
                                <MaterialCommunityIcons
                                    name="calendar-week"
                                    size={17}
                                    color="#fff"
                                />
                            }
                            title="Média semanal"
                            subtitle="Ritmo médio recente"
                            value={`${stats.avgPerWeek}`}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}