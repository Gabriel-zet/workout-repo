import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { formatWeekdayName } from '@/utils/date';

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
        <View className="h-full w-full" style={{ aspectRatio: 1 }}>
            <View className="flex-1 overflow-hidden rounded-[36px] border border-outline-subtle bg-surface p-5">
                <View className="absolute bottom-[-90px] right-[-60px] top-[20%] w-[120px] overflow-hidden">
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

                <View className="flex-col">
                    <View className="flex-row items-center">
                        <FontAwesome5 name="dumbbell" size={12} color="#FFFFFF" />
                        <Text className="ml-2.5 text-sm font-firs-regular text-foreground">
                            {data ? 'Treino da semana' : 'Nenhum treino'}
                        </Text>
                    </View>

                    {data ? (
                        <View className="mt-2 gap-3 flex-col flex justify-around max-h-[130px] h-full">
                            <View className="gap-2 max-w-32">
                                <Text className="text-lg font-firs-regular text-foreground">
                                    {data.title}
                                </Text>
                                <Text className="text-sm font-firs-regular text-foreground">
                                    {data?.notes}
                                </Text>
                            </View>

                            {/* <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
                                <Text className="ml-1 text-sm font-firs-regular text-foreground">
                                    {formatWeeklySchedule(data.date)}
                                </Text>
                            </View> */}
                            <TouchableOpacity
                                onPress={handleViewWorkout}
                                className="self-start rounded-full bg-surface-muted px-6 py-2"
                            >
                                <Text className="text-sm font-firs-medium text-foreground">
                                    Ver treino
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="mt-2 gap-3">
                            <Text className="text-base font-firs-regular text-foreground-muted">
                                {selectedDate
                                    ? `Sem treino para ${formatWeekdayName(selectedDate)}`
                                    : 'Sem treino nesse dia'}
                            </Text>
                            <Text className="text-sm font-firs-regular text-foreground-subtle">
                                Escolha outro dia da semana ou crie um treino
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
