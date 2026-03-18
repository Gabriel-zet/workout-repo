import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; // Importação atualizada

export default function WeightCard() {
  // Configuração dos traços (ticks) da balança na parte inferior
  const totalTicks = 17;
  const middleIndex = Math.floor(totalTicks / 2);

  return (
    <View className="bg-[#131313] rounded-[48px] p-8 items-center w-[340px] border border-neutral-900 shadow-xl">
      
      {/* Data */}
      <Text className="text-white text-2xl font-regular mb-1">
        Hoje, Março 12
      </Text>

      {/* Peso Principal */}
      <Text className="text-[#FF6B00] text-[100px] leading-[110px] font-medium tracking-tighter">
        86.4
      </Text>

      {/* Subtítulo da Meta */}
      <View className="flex-row items-center mt-1 mb-10 opacity-60">
        {/* Ícone atualizado para FontAwesome5 */}
        <FontAwesome5 name="flag-checkered" size={18} color="#FFFFFF" />
        <Text className="text-white text-xl font-regular ml-3">
          16.4 kg até a meta
        </Text>
      </View>

      {/* Gráfico do Mostrador em Arco */}
      <View className="w-full h-[60px] relative items-center justify-end overflow-hidden">
        {Array.from({ length: totalTicks }).map((_, index) => {
          const i = index - middleIndex;
          const isCenter = i === 0;

          return (
            <View
              key={index}
              className="absolute bottom-[-140px] items-center justify-start"
              style={{
                height: 200, // Altura do "raio" invisível que cria a curva
                width: 4,
                transform: [{ rotate: `${i * 5}deg` }], // Rotaciona a partir do centro inferior
              }}
            >
              {/* O traço visível */}
              <View
                className={`rounded-full ${
                  isCenter ? "bg-[#FF6B00]" : "bg-white"
                }`}
                style={{
                  width: isCenter ? 4 : 3,
                  // Deixa o centro mais alto e diminui o tamanho nas bordas
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