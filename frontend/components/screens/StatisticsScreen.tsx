import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import type { Workout } from '@/hooks/useWorkouts';
import theme from '@/constants/theme';
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
        <View className="rounded-[24px] border border-outline-subtle bg-surface-elevated p-4">
            <View className="mb-5 flex-row items-center justify-between">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted">
                    {icon}
                </View>
                {badge ? (
                    <Text className="text-[12px] font-firs-medium text-foreground-muted">
                        {badge}
                    </Text>
                ) : null}
            </View>

            <Text className="mb-1 text-[13px] font-firs-regular text-foreground-muted">
                {label}
            </Text>
            <Text className="text-[24px] font-firs-bold tracking-tight text-foreground">
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
            className={`bg-surface-elevated px-4 py-4 ${first ? 'rounded-t-[22px]' : ''} ${last ? 'rounded-b-[22px]' : ''}`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted">
                        {icon}
                    </View>

                    <View className="flex-1">
                        <Text className="text-[15px] font-firs-medium text-foreground">
                            {title}
                        </Text>
                        <Text className="mt-1 text-[13px] font-firs-regular text-foreground-muted">
                            {subtitle}
                        </Text>
                    </View>
                </View>

                <Text className="text-[15px] font-firs-bold text-foreground">{value}</Text>
            </View>
        </View>
    );
}

export default function StatisticsScreen({
    workouts = [],
    loading = false,
}: StatisticsScreenProps) {
    const insets = useSafeAreaInsets();
    const stats = useMemo(() => calculateStats(workouts), [workouts]);

    if (loading && workouts.length === 0) {
        return (
            <SafeAreaView
                className="flex-1 items-center justify-center bg-canvas"
                edges={['left', 'right']}
            >
                <ActivityIndicator size="large" color={theme.colors.brand} />
            </SafeAreaView>
        );
    }

    const completion7 = formatCompletionRate(stats.workoutsLast7Days, 7);
    const completion30 = formatCompletionRate(stats.workoutsLast30Days, 30);

    return (
        <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="px-6 pb-7" style={{ paddingTop: insets.top + 16 }}>
                    <Text className="text-[32px] font-firs-black tracking-tight text-foreground">
                        Estatísticas
                    </Text>
                    <Text className="mt-1 text-[14px] font-firs-regular text-foreground-muted">
                        Seu progresso de treino em uma visão mais clara
                    </Text>
                </View>

                <View className="mb-8 px-6">
                    <View className="overflow-hidden rounded-[28px] border border-outline-subtle bg-surface-soft px-5 py-5">
                        <View className="flex-row items-end justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="mb-2 text-[13px] font-firs-regular text-foreground-muted">
                                    Total de treinos
                                </Text>
                                <Text className="text-[42px] font-firs-bold leading-[46px] tracking-tight text-foreground">
                                    {stats.totalWorkouts}
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
                                        {stats.streak} dias
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-8 px-6">
                    <Text className="mb-4 text-[18px] font-firs-bold text-foreground">
                        Indicadores
                    </Text>

                    <View className="-mx-2 flex-row flex-wrap">
                        <View className="mb-4 w-1/2 px-2">
                            <StatMiniCard
                                icon={
                                    <Feather
                                        name="calendar"
                                        size={18}
                                        color={theme.colors.text}
                                    />
                                }
                                label="Últimos 7 dias"
                                value={`${stats.workoutsLast7Days}`}
                                badge={completion7}
                            />
                        </View>

                        <View className="mb-4 w-1/2 px-2">
                            <StatMiniCard
                                icon={
                                    <Feather
                                        name="calendar"
                                        size={18}
                                        color={theme.colors.text}
                                    />
                                }
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
                                        color={theme.colors.text}
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
                                        color={theme.colors.text}
                                    />
                                }
                                label="Sequência"
                                value={`${stats.streak}`}
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-8 px-6">
                    <Text className="mb-4 text-[18px] font-firs-bold text-foreground">
                        Períodos
                    </Text>

                    <View className="overflow-hidden rounded-[22px] border border-outline-subtle">
                        <PeriodRow
                            first
                            icon={
                                <Feather
                                    name="activity"
                                    size={17}
                                    color={theme.colors.text}
                                />
                            }
                            title="Últimos 7 dias"
                            subtitle={`${stats.workoutsLast7Days} treinos registrados`}
                            value={completion7}
                        />

                        <View className="h-px bg-outline" />

                        <PeriodRow
                            icon={
                                <Feather
                                    name="bar-chart-2"
                                    size={17}
                                    color={theme.colors.text}
                                />
                            }
                            title="Últimos 30 dias"
                            subtitle={`${stats.workoutsLast30Days} treinos registrados`}
                            value={completion30}
                        />

                        <View className="h-px bg-outline" />

                        <PeriodRow
                            last
                            icon={
                                <MaterialCommunityIcons
                                    name="calendar-week"
                                    size={17}
                                    color={theme.colors.text}
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

