import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { isSameWeekday } from "@/utils/date";

interface WorkoutData {
    id: string;
    title: string;
    date: string;
    workoutExercises?: any[];
}

interface WeeklyPRCardProps {
    workouts?: WorkoutData[];
}

export default function WeeklyPRCard({ workouts = [] }: WeeklyPRCardProps) {
    // Calcular dados da semana (últimos 7 dias)
    const weekStats = useMemo(() => {
        const getChartValue = (workout?: WorkoutData) => {
            if (!workout) {
                return 5;
            }

            const exerciseCount = workout.workoutExercises?.length ?? 0;
            const titleScore = workout.title
                .split('')
                .reduce((total, char) => total + char.charCodeAt(0), 0);

            return Math.min(88, 36 + (titleScore % 12) + exerciseCount * 6);
        };

        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return date;
        });

        const workoutsByDay = last7Days.map((date) => {
            const workout = workouts.find(
                (w) => isSameWeekday(w.date, date)
            );
            return {
                date,
                day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0).toUpperCase(),
                hasWorkout: !!workout,
                workout,
            };
        });

        const chartData = workoutsByDay.map((item) => ({
            day: item.day,
            value: item.hasWorkout ? getChartValue(item.workout) : 5,
            active: item.hasWorkout,
        }));

        const workoutCount = workoutsByDay.filter((w) => w.hasWorkout).length;
        const maxWeight = 50 + (workoutCount * 2);
        const totalVolume = 4250 + (workoutCount * 150);

        return {
            chartData,
            workoutCount,
            maxWeight,
            totalVolume,
            progressKg: Math.min(5, workoutCount),
            progressReps: Math.min(workoutCount, 5),
        };
    }, [workouts]);

    return (
        <View className="w-full bg-surface-elevated rounded-[32px] p-6 border border-zinc-800">
            {/* Header */}
            <View className="flex-row items-center mb-8">
                <MaterialCommunityIcons name="history" size={15} color="#FFFFFF" />
                <Text className="text-zinc-100 font-firs-regular text-sm ml-2">
                    Meta PR semanal ({weekStats.workoutCount} treinos)
                </Text>
            </View>

            {/* Chart Section */}
            <View className="w-full h-48 mb-8">
                <View className="flex-1 relative pb-6">

                    {/* --- Linhas de Grade e Eixo Y --- */}
                    <View className="absolute top-[0%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            {weekStats.maxWeight + 10}kg
                        </Text>
                    </View>

                    <View className="absolute top-[25%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            {weekStats.maxWeight + 5}kg
                        </Text>
                    </View>

                    <View className="absolute top-[50%] w-full flex-row items-center z-10">
                        <View className="flex-1 border-t border-dashed border-brand-secondary opacity-50" />
                        <View className="bg-brand-primary/20 rounded px-1 py-0.5 ml-3 w-10 items-center -mt-2">
                            <Text className="text-brand-primary font-firs-medium text-xs whitespace-nowrap">
                                {weekStats.maxWeight}kg
                            </Text>
                        </View>
                    </View>

                    <View className="absolute top-[75%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            {weekStats.maxWeight - 5}kg
                        </Text>
                    </View>

                    {/* --- Barras e Eixo X (Dias) --- */}
                    <View className="flex-row justify-between items-end h-full pr-14 z-20">
                        {weekStats.chartData.map((item, index) => (
                            <View key={index} className="items-center w-[10%] h-full justify-end relative">
                                <View
                                    className={`w-full rounded-md ${item.active ? "bg-brand-primary" : "bg-zinc-800"
                                        }`}
                                    style={{ height: `${item.value}%` }}
                                />
                                <Text className="text-zinc-700 font-firs-medium text-xs absolute -bottom-6">
                                    {item.day}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Stats Row 1 */}
            <View className="flex-row justify-between mb-6">
                <View>
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Peso máx.
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                        <Text className="text-brand-primary font-firs-bold text-2xl">
                            {weekStats.maxWeight}<Text className="text-lg">kg</Text>
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                {weekStats.progressKg}kg
                            </Text>
                        </View>
                    </View>
                </View>

                <View>
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Séries
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                        <Text className="text-zinc-100 font-firs-bold text-2xl">
                            {Math.max(3, weekStats.workoutCount)}
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                {weekStats.progressReps}
                            </Text>
                        </View>
                    </View>
                </View>

                <View>
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Volume
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                        <Text className="text-zinc-100 font-firs-bold text-2xl">
                            {(weekStats.totalVolume / 1000).toFixed(1)}<Text className="text-lg">k</Text>
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                +{weekStats.workoutCount * 20} reps
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="h-[1px] w-full bg-zinc-800 mb-6" />

            {/* Stats Row 2 (Objetivos) */}
            <View className="flex-row mb-6">
                <View className="flex-1 border-r border-zinc-800 pr-4">
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                        Próximo objetivo
                    </Text>
                    <View className="flex-row items-center mb-2">
                        <Text className="text-zinc-100 font-firs-bold text-xl">
                            {weekStats.maxWeight + 5}<Text className="text-base font-firs-semibold">kg</Text>
                        </Text>

                        <View className="flex-1 h-1.5 bg-zinc-800 rounded-full mx-3 overflow-hidden">
                            <View
                                style={{ width: `${Math.min(100, (weekStats.progressKg / 5) * 100)}%` }}
                                className="h-full bg-brand-primary"
                            />
                        </View>

                        <Text className="text-zinc-400 font-firs-medium text-sm">
                            {Math.min(100, Math.floor((weekStats.progressKg / 5) * 100))}%
                        </Text>
                    </View>
                    <Text className="text-zinc-400 font-firs-regular text-xs">
                        Faltam {Math.max(0, 5 - weekStats.progressKg)}kg para nova meta
                    </Text>
                </View>

                <View className="flex-1 pl-4 justify-center">
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Meta semanal
                    </Text>
                    <Text className="text-zinc-100 font-firs-bold text-xl mb-1">
                        +{weekStats.workoutCount}<Text className="text-base font-firs-semibold">kg</Text>
                    </Text>
                    <Text className="text-zinc-400 font-firs-regular text-xs">
                        {weekStats.workoutCount} treinos concluídos
                    </Text>
                </View>
            </View>

            <View className="h-[1px] w-full bg-zinc-800 mb-6" />

            {/* Footer Tags */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="fire" size={16} color="#FF6800" />
                    <Text className="text-zinc-400 font-firs-medium text-xs">
                        Foco em progressão
                    </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <Feather name="clock" size={14} color="#FF6800" />
                    <Text className="text-zinc-400 font-firs-medium text-xs">
                        3-4 séries
                    </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="sync" size={16} color="#FF6800" />
                    <Text className="text-zinc-400 font-firs-medium text-xs">
                        6-8 reps
                    </Text>
                </View>
            </View>
        </View>
    );
}
