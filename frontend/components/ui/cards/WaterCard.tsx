import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function WaterCard() {
  // Configuração da barra de progresso
  const totalBars = 12;
  const filledBars = 7; // Representa o 1.5L de 2.5L

  return (
    <View className="bg-[#131313] rounded-[48px] py-10 px-8 w-[340px] border border-neutral-900 shadow-xl">
      
      {/* Cabeçalho */}
      <View className="flex-row items-center mb-4">
        {/* Usando o glass-whiskey do FA5 que lembra o copo quadrado do design */}
        <FontAwesome5 name="glass-whiskey" size={20} color="#FFFFFF" />
        <Text className="text-white text-2xl font-regular ml-3">
          Água diária
        </Text>
      </View>

      {/* Conteúdo Principal (Valor + Meta) */}
      <View className="flex-row items-center mb-6">
        <Text className="text-[#FF6B00] text-[100px] leading-[110px] font-medium tracking-tighter mr-3">
          1.5
        </Text>

        <View className="flex-col justify-center mt-2">
          {/* Badge de Aumento */}
          <View className="bg-[#303E00] rounded-full px-3 py-1 flex-row items-center self-start mb-1">
            <FontAwesome5 name="arrow-up" size={12} color="#A3E600" />
            <Text className="text-[#A3E600] font-semibold ml-1 text-sm">
              900 ml
            </Text>
          </View>
          
          {/* Valor Total */}
          <Text className="text-white text-2xl font-medium">
            /2.5 Litros
          </Text>
        </View>
      </View>

      {/* Barra de Progresso em Gomos */}
      <View className="bg-[#262626] rounded-2xl py-4 px-4 flex-row justify-between mb-6">
        {Array.from({ length: totalBars }).map((_, index) => {
          const isFilled = index < filledBars;
          return (
            <View
              key={index}
              className={`w-[10px] h-[36px] rounded-full ${
                isFilled ? "bg-[#FF6B00]" : "bg-[#452615]"
              }`}
            />
          );
        })}
      </View>

      {/* Rodapé (Restante) */}
      <View className="flex-row items-center justify-center opacity-60">
        <FontAwesome5 name="flag-checkered" size={16} color="#FFFFFF" />
        <Text className="text-white text-lg font-regular ml-3">
          1 litro até meta
        </Text>
      </View>
      
    </View>
  );
}