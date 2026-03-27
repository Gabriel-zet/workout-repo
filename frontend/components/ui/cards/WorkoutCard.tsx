import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

interface WorkoutData {
    id: string;
    title: string;
    date: string;
    notes?: string;
}

interface WorkoutCardProps {
    data?: WorkoutData;
}

export default function WorkoutCard({ data }: WorkoutCardProps) {
    const router = useRouter();

    const handleViewWorkout = () => {
        if (data?.id) {
            router.push({
                pathname: '/workout-detail',
                params: { id: data.id },
            });
        }
    };

    const getEstimatedDuration = () => {
        // Mock: calcular duração estimada baseada no title
        if (data?.title?.toLowerCase().includes('push')) {
            return '1h:30m';
        } else if (data?.title?.toLowerCase().includes('pull')) {
            return '1h:45m';
        } else if (data?.title?.toLowerCase().includes('leg')) {
            return '2h:00m';
        }
        return '1h:00m';
    };

    return (
        <View className="w-full h-full" style={{ aspectRatio: 1 }}>
            <View
                className="bg-[#111111] rounded-[36px] p-5 overflow-hidden flex-1 flex">

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

                {/* CONTEÚDO */}
                <View className="flex-col">
                    {/* Cabeçalho */}
                    <View className="flex-row items-center">
                        <FontAwesome5 name="dumbbell" size={12} color="#FFFFFF" />
                        <Text className="text-white text-sm font-firs-regular ml-2.5">
                            {data ? 'Treino planejado' : 'Nenhum treino'}
                        </Text>
                    </View>

                    {data ? (
                        <View className="gap-3 mt-2">
                            <Text className="text-white text-lg font-firs-regular">
                                {data.title}
                            </Text>

                            <View className="flex-row items-center">
                                <Ionicons name="alarm" size={12} color="#FFFFFF" />
                                <Text className="text-white ml-1 text-sm font-firs-regular">
                                    {getEstimatedDuration()}
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
                                Sem treino hoje
                            </Text>
                            <Text className="text-zinc-600 text-sm font-firs-regular">
                                Planeja seu treino para começar
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
