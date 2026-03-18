import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface StreakCardProps {
  streakText?: string;
  progressCount?: number;
  calories?: number;
}

export default function StreakCard({
  streakText = '24',
  progressCount = 23,
  calories = 687,
}: StreakCardProps) {

  const rows = [
    [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  ];

  const getDayStatus = (day: number) => {
    if (day < progressCount) return 'solid';
    if (day === progressCount) return 'outline';
    return 'dark';
  };

  return (
    <View className="bg-[#111111] rounded-[36px] p-7 border-2 border-[#2A2A2A] self-center w-full max-w-[360px]">
      
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Text className="text-[#FF6600] text-[72px] font-medium leading-[80px] tracking-[-2px]">
          {streakText}
        </Text>

        <View className="ml-4 justify-center">
          <Text className="text-white text-2xl font-medium leading-[30px]">
            dias
          </Text>
          <Text className="text-white text-2xl font-medium leading-[30px]">
            seguidos
          </Text>
        </View>
      </View>

      {/* Grid */}
      <View className="flex-col gap-1.5">
        {rows.map((row, i) => (
          <View key={i} className="flex-row justify-between">
            {row.map((day) => {
              const status = getDayStatus(day);

              return (
                <View
                  key={day}
                  className={`
                    w-[26px] h-[26px] rounded-full
                    ${status === 'solid' ? 'bg-[#FF6600]' : ''}
                    ${status === 'outline' ? 'border-2 border-[#FF6600]' : ''}
                    ${status === 'dark' ? 'bg-[#3B1A0A]' : ''}
                  `}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-center mt-7">
        <FontAwesome5 name="fire" size={20} color="#FF6600" />

        <Text className="text-white text-[20px] font-medium ml-2.5 mr-1.5">
          {calories} kcal
        </Text>

        <Text className="text-[#8C8C8C] text-[20px] font-medium">
          queimadas
        </Text>
      </View>
    </View>
  );
}