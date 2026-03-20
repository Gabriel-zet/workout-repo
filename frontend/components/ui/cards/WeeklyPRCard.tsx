import React from "react";
import { View, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function WeeklyPRCard() {
    // Dados simulados para o gráfico
    const chartData = [
        { day: "D", value: 35, active: true },
        { day: "S", value: 45, active: true },
        { day: "T", value: 65, active: true },
        { day: "Q", value: 30, active: true },
        { day: "Q", value: 50, active: true },
        { day: "S", value: 5, active: false },
        { day: "S", value: 5, active: false },
    ];

    return (
        <View className="w-full bg-surface-elevated rounded-[32px] p-6 border border-zinc-800">
            {/* Header */}
            <View className="flex-row items-center mb-8">
                <MaterialCommunityIcons name="history" size={15} color="#FFFFFF" />
                <Text className="text-zinc-100 font-firs-regular text-sm ml-2">
                    Meta PR semanal
                </Text>
            </View>

            {/* Chart Section */}
            <View className="w-full h-48 mb-8">
                <View className="flex-1 relative pb-6">

                    {/* --- Linhas de Grade e Eixo Y --- */}
                    {/* Linha 60kg (0%) */}
                    <View className="absolute top-[0%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            60kg
                        </Text>
                    </View>

                    {/* Linha 55kg (25%) */}
                    <View className="absolute top-[25%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            55kg
                        </Text>
                    </View>

                    {/* Linha 50kg (50% - Target) */}
                    <View className="absolute top-[50%] w-full flex-row items-center z-10">
                        <View className="flex-1 border-t border-dashed border-brand-secondary opacity-50" />
                        <View className="bg-brand-primary/20 rounded px-1 py-0.5 ml-3 w-10 items-center -mt-2">
                            <Text className="text-brand-primary font-firs-medium text-xs whitespace-nowrap">
                                50kg
                            </Text>
                        </View>
                    </View>

                    {/* Linha 45kg (75%) */}
                    <View className="absolute top-[75%] w-full flex-row items-center z-0">
                        <View className="flex-1 border-t border-dashed border-zinc-800" />
                        <Text className="text-zinc-700 font-firs-medium text-xs w-10 text-right ml-3 -mt-2 px-1">
                            45kg
                        </Text>
                    </View>

                    {/* --- Barras e Eixo X (Dias) --- */}
                    {/* pr-14 cria um "respiro" na direita exatamente do tamanho dos textos do Eixo Y */}
                    <View className="flex-row justify-between items-end h-full pr-14 z-20">
                        {chartData.map((item, index) => (
                            /* Adicionado: h-full, justify-end e relative */
                            <View key={index} className="items-center w-[10%] h-full justify-end relative">
                                <View
                                    className={`w-full rounded-md ${item.active ? "bg-brand-primary" : "bg-zinc-800"
                                        }`}
                                    style={{ height: `${item.value}%` }}
                                />
                                {/* O texto agora fica posicionado relativo a própria coluna */}
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
                            50<Text className="text-lg">kg</Text>
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                5kg
                            </Text>
                        </View>
                    </View>
                </View>

                <View>
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Series
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                        <Text className="text-zinc-100 font-firs-bold text-2xl">5</Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                1
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
                            4,250<Text className="text-lg">kg</Text>
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="arrow-up" size={12} color="#A6FF00" />
                            <Text className="text-brand-success font-firs-medium text-sm">
                                86 reps
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="h-[1px] w-full bg-zinc-800 mb-6" />

            {/* Stats Row 2 (Objetivos) */}
            <View className="flex-row mb-6">
                {/* Left Column */}
                <View className="flex-1 border-r border-zinc-800 pr-4">
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                        Próximo objetivo
                    </Text>
                    <View className="flex-row items-center mb-2">
                        <Text className="text-zinc-100 font-firs-bold text-xl">
                            55<Text className="text-base font-firs-semibold">kg</Text>
                        </Text>

                        {/* Progress Bar */}
                        <View className="flex-1 h-1.5 bg-zinc-800 rounded-full mx-3 overflow-hidden">
                            <View className="w-[90%] h-full bg-brand-primary" />
                        </View>

                        <Text className="text-zinc-400 font-firs-medium text-sm">90%</Text>
                    </View>
                    <Text className="text-zinc-400 font-firs-regular text-xs">
                        Faltam 5kg para nova meta
                    </Text>
                </View>

                {/* Right Column */}
                <View className="flex-1 pl-4 justify-center">
                    <Text className="text-zinc-400 font-firs-regular text-sm mb-1">
                        Próximo objetivo
                    </Text>
                    <Text className="text-zinc-100 font-firs-bold text-xl mb-1">
                        +2.5<Text className="text-base font-firs-semibold">kg</Text>
                    </Text>
                    <Text className="text-zinc-400 font-firs-regular text-xs">
                        na próxima semana
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