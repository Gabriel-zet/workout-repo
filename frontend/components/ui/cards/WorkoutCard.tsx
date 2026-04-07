import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { formatWeekdayName, formatWeeklySchedule } from '@/utils/date';

interface WorkoutData {
    id: string;
    title: string;
    date: string;
    notes?: string;
}

interface WorkoutCardProps {
    data?: WorkoutData;
    selectedDate?: Date;
}

export default function WorkoutCard({ data, selectedDate }: WorkoutCardProps) {
    const router = useRouter();

    const handleViewWorkout = () => {
        if (data?.id) {
            router.push({
                pathname: '/workout-detail',
                params: { id: data.id },
            });
        }
    };

    return (
        <View className="w-full h-full" style={{ aspectRatio: 1 }}>
            <View className="bg-[#111111] rounded-[36px] p-5 overflow-hidden flex-1 flex">
                {/* IMAGEM (Ramon Dino) */}
                <View className="absolute right-[-60px] top-[20%] bottom-[-90px] w-[120px] overflow-hidden">
                    <Image
                        source={require('@/assets/images/human.png')}
                        style={{
                            width: 180,
                            height: '100%',
                            position: 'absolute',
                            left: -40,
                        }}
                        resizeMode="contain"
                    />
                </View>

                {/* CONTEUDO */}
                <View className="flex-col">
                    {/* Cabecalho */}
                    <View className="flex-row items-center">
                        <FontAwesome5 name="dumbbell" size={12} color="#FFFFFF" />
                        <Text className="text-white text-sm font-firs-regular ml-2.5">
                            {data ? 'Treino da semana' : 'Nenhum treino'}
                        </Text>
                    </View>

                    {data ? (
                        <View className="gap-3 mt-2">
                            <Text className="text-white text-lg font-firs-regular">
                                {data.title}
                            </Text>

                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
                                <Text className="text-white ml-1 text-sm font-firs-regular">
                                    {formatWeeklySchedule(data.date)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleViewWorkout}
                                className="bg-[#2A2A2A] rounded-full px-6 py-2 self-start"
                            >
                                <Text className="text-white text-sm font-firs-medium">
                                    Ver treino
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="gap-3 mt-2">
                            <Text className="text-zinc-500 text-base font-firs-regular">
                                {selectedDate
                                    ? `Sem treino para ${formatWeekdayName(selectedDate)}`
                                    : 'Sem treino nesse dia'}
                            </Text>
                            <Text className="text-zinc-600 text-sm font-firs-regular">
                                Escolha outro dia da semana ou crie um treino
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
