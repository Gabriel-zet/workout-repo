import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function WaterCard() {
  // Configuração da barra de progresso
  const totalBars = 12;
  const filledBars = 7; // Representa o 1.5L de 2.5L

  return (
    <View className="bg-[#111111] rounded-[36px] p-5 border-2 border-[#2A2A2A] w-full h-full flex flex-col">

      {/* Cabeçalho */}
      <View className="flex-row items-center">
        {/* Usando o glass-whiskey do FA5 que lembra o copo quadrado do design */}
        <FontAwesome5 name="glass-whiskey" size={12} color="#FFFFFF" />
        <Text className="text-white text-sm font-regular ml-2.5">
          Água diária
        </Text>
      </View>

      {/* Conteúdo Principal (Valor + Meta) */}
      <View className="flex-row items-center">
        <Text className="text-[#FF6B00] text-[50px] font-medium mr-2.5">
          1.5
        </Text>

        <View className="flex-col justify-center">
          {/* Badge de Aumento */}
          <View className="bg-[#303E00] rounded-full px-2.5 py-0.5 flex-row items-center self-start mb-1">
            <FontAwesome5 name="arrow-up" size={10} color="#A3E600" />
            <Text className="text-[#A3E600] font-medium ml-1 text-sm">
              900 ml
            </Text>
          </View>

          {/* Valor Total */}
          <Text className="text-white text-md font-regular">
            /2.5 Litros
          </Text>
        </View>
      </View>

      {/* Barra de Progresso em Gomos */}
      <View className="bg-[#262626] rounded-xl py-2 px-3 flex-row justify-between mb-2">
        {Array.from({ length: totalBars }).map((_, index) => {
          const isFilled = index < filledBars;
          return (
            <View
              key={index}
              className={`w-[5px] h-[26px] rounded-full ${isFilled ? "bg-[#FF6B00]" : "bg-[#452615]"
                }`}
            />
          );
        })}
      </View>

      {/* Rodapé (Restante) */}
      <View className="flex-row items-center justify-center opacity-60">
        <FontAwesome5 name="flag-checkered" size={12} color="#FFFFFF" />
        <Text className="text-white text-sm font-regular ml-2.5">
          1 litro até meta
        </Text>
      </View>

    </View>
  );
}