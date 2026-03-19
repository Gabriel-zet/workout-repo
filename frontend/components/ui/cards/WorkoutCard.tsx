import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function WorkoutCard() {
    return (
        <View className="w-full h-full" style={{ aspectRatio: 1 }}>
            <View
                className="bg-[#111111] rounded-[36px] p-5 overflow-hidden flex-1 flex">

                {/* IMAGEM (Ramon Dino) */}
                <View className="absolute right-[-60px] top-[20%] bottom-[-90px] w-[120px] overflow-hidden">
                    <Image
                        source={require('@/assets/images/human.png')}
                        style={{
                            width: 180,   // maior que o container
                            height: '100%',
                            position: 'absolute',
                            left: -40,    // joga pra esquerda pra cortar
                        }}
                        resizeMode="contain"
                    />
                </View>

                {/* CONTEÚDO */}
                <View className="flex-col">
                    {/* Cabeçalho */}
                    <View className="flex-row items-center">
                        <FontAwesome5 name="dumbbell" size={12} color="#FFFFFF" />
                        <Text className="text-white text-sm font-regular ml-2.5">
                            Treino diário
                        </Text>
                    </View>

                    <View className="gap-3 mt-2">
                        <Text className="text-white text-lg font-regular">
                            Push - peso por lado
                        </Text>

                        <View className="flex-row items-center">
                            <Ionicons name="alarm" size={12} color="#FFFFFF" />
                            <Text className="text-white ml-1 text-sm font-regular">
                                1h:30m
                            </Text>
                        </View>
                        <TouchableOpacity className="bg-[#2A2A2A] rounded-full px-6 py-2 self-start">
                            <Text className="text-white text-sm font-medium">
                                Ver treino
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
    );
}