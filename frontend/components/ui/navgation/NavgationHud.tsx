import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationHudProps = {
    selectedDate: Date;
};

function getDayName(date: Date): string {
    const day = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
    });

    // Capitalizar a primeira letra do dia da semana
    return day.charAt(0).toUpperCase() + day.slice(1);
}

export default function NavigationHud({ selectedDate }: NavigationHudProps) {
    return (
        <View className="px-5 pt-10 pb-4">
            <View className="flex-row items-center justify-between">

                {/* Botão Menu */}
                <TouchableOpacity className="bg-[#1c1c1e] w-14 h-14 rounded-2xl items-center justify-center">
                    <MaterialIcons name="drag-handle" size={32} color="white" />
                </TouchableOpacity>

                {/* Títulos Centrais */}
                <View className="items-center">
                    <Text className="text-white text-2xl font-firs-semibold tracking-tight">
                        {getDayName(selectedDate)}
                    </Text>

                    <Text className="text-[#8e8e93] text-sm mt-1">
                        Push - peso por lado
                    </Text>
                </View>

                {/* Avatar */}
                <TouchableOpacity className="relative">
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?u=neo' }}
                        className="w-14 h-14 rounded-full bg-neutral-800"
                    />
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#ff6b00] rounded-full border-2 border-[#09090b]" />
                </TouchableOpacity>

            </View>
        </View>
    );
}
