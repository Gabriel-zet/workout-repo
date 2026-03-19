import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function WeightCard() {
  // Configuração dos traços (ticks) da balança na parte inferior
  const totalTicks = 17;
  const middleIndex = Math.floor(totalTicks / 2);

  return (
    <View
      className="bg-[#111111] rounded-[36px] p-2 border-[15px] border-[#111111] w-full h-full flex flex-col items-center overflow-hidden relative">

      {/* Data */}
      <Text className="text-white text-xs font-regular mt-2">
        Hoje, Março 12
      </Text>

      {/* Peso Principal */}
      <Text
        className="text-[#FF6B00] text-[60px] leading-[50px] font-medium mt-3"
        style={{ textAlignVertical: 'center' }}
      >
        86.4
      </Text>

      {/* Subtítulo da Meta */}
      <View className="flex-row items-center mb-10 opacity-60 flex-1 justify-center">
        {/* Ícone atualizado para FontAwesome5 */}
        <FontAwesome5 name="flag-checkered" size={10} color="#FFFFFF" />
        <Text className="text-white text-xs font-regular ml-1.5">
          16.4 kg até a meta
        </Text>
      </View>

      {/* Gráfico do Mostrador em Arco */}
      <View className="w-full h-[60px] absolute bottom-[-30px] items-center justify-end">
        {Array.from({ length: totalTicks }).map((_, index) => {
          const i = index - middleIndex;
          const isCenter = i === 0;

          return (
            <View
              key={index}
              className="absolute bottom-[-140px] items-center justify-start"
              style={{
                height: 200,
                width: 4,
                transform: [{ rotate: `${i * 5}deg` }],
              }}
            >
              <View
                className={`rounded-full ${isCenter ? "bg-[#FF6B00]" : "bg-white"}`}
                style={{
                  width: isCenter ? 4 : 3,
                  height: isCenter ? 48 : 26 - Math.abs(i) * 1.2,
                }}
              />
            </View>
          );
        })}
      </View>

    </View>
  );
}