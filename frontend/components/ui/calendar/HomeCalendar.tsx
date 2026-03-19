import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Dados simulados para a semana
const weekDays = [
    { id: '1', day: 'D', date: '02', active: false },
    { id: '2', day: 'S', date: '03', active: false },
    { id: '3', day: 'T', date: '04', active: false },
    { id: '4', day: 'Q', date: '05', active: false },
    { id: '5', day: 'Q', date: '06', active: true, hasNotification: true },
    { id: '6', day: 'S', date: '07', active: false },
    { id: '7', day: 'S', date: '08', active: false },
];

export default function HomeCalendar() {
    return (
        <SafeAreaView className="flex-1">
            <StatusBar style="light" />

            <View className="px-5 pt-10 pb-4">
                {/* Header */}
                <View className="flex-row items-center justify-between">

                    {/* Botão Menu */}
                    <TouchableOpacity className="bg-[#1c1c1e] w-14 h-14 rounded-2xl items-center justify-center">
                        <MaterialIcons name="drag-handle" size={32} color="white" />
                    </TouchableOpacity>

                    {/* Títulos Centrais */}
                    <View className="items-center">
                        <Text className="text-white text-2xl font-semibold tracking-tight">
                            Quinta-feira
                        </Text>
                        <Text className="text-[#8e8e93] text-sm mt-1">
                            Push - peso por lado
                        </Text>
                    </View>

                    {/* Avatar com Notificação */}
                    <TouchableOpacity className="relative">
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?u=neo' }} // Substitua pela imagem correta
                            className="w-14 h-14 rounded-full bg-neutral-800"
                        />
                        <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#ff6b00] rounded-full border-2 border-[#09090b]" />
                    </TouchableOpacity>
                </View>

                {/* Barra de Dias da Semana */}
                <View className="flex-row justify-between items-center mt-12 w-full px-1">
                    {weekDays.map((item) => {
                        const isActive = item.active;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.8}
                                className={`
                                items-center justify-between rounded-2xl
                                ${isActive
                                        ? 'bg-white w-[14.2%] py-2 gap-2'
                                        : 'bg-[#1c1c1e] w-[13.5%] py-2 gap-1'}
                                `}
                            >
                                {/* Topo (Letra + ponto) */}
                                <View className="flex-row items-center justify-center">
                                    <Text
                                        className={`
                                            font-medium text-sm
                                            ${isActive ? 'text-black' : 'text-[#8e8e93]'}
                                        `}
                                        style={{ letterSpacing: 0.5 }}
                                    >
                                        {item.day}
                                    </Text>

                                    {item.hasNotification && isActive && (
                                        <View className="w-[6px] h-[6px] bg-brand-primary rounded-full ml-1.5 mt-[2px]" />
                                    )}
                                </View>

                                {/* Número */}
                                <Text
                                    className={`
                                        ${isActive
                                            ? 'text-black text-3xl font-semibold'
                                            : 'text-[#8e8e93] text-xl font-medium'}
                                    `}
                                    style={{
                                        lineHeight: isActive ? 28 : 20,
                                        letterSpacing: -1,
                                    }}
                                >
                                    {item.date}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </View>
        </SafeAreaView>
    );
}