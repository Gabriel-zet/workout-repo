import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const circleSize = (width - 32 - 20) / 25;

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
    <View className="h-full w-full rounded-[36px] border border-outline-subtle bg-surface p-5">
      <View className="flex-row items-center">
        <Text className="text-[48px] font-firs-medium text-brand-primary">
          {streakText}
        </Text>

        <View className="ml-4 justify-center">
          <Text className="text-lg font-firs-regular leading-[20px] text-foreground">
            dias
          </Text>
          <Text className="text-lg font-firs-regular leading-[20px] text-foreground">
            seguidos
          </Text>
        </View>
      </View>

      <View className="flex-1 flex-col justify-center gap-1">
        {rows.map((row, i) => (
          <View key={i} className="flex-row justify-between">
            {row.map((day) => {
              const status = getDayStatus(day);

              return (
                <View
                  key={day}
                  style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                  }}
                  className={`${
                    status === 'solid'
                      ? 'bg-brand-primary'
                      : status === 'outline'
                        ? 'border-2 border-brand-primary'
                        : 'bg-brand-soft'
                  }`}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View className="mt-3 flex-row items-center justify-center">
        <FontAwesome5 name="fire" size={10} color="#FF6B00" />

        <Text className="ml-2.5 mr-1.5 text-sm font-firs-regular text-foreground">
          {calories} kcal
        </Text>

        <Text className="text-sm font-firs-regular text-foreground-subtle">
          queimadas
        </Text>
      </View>
    </View>
  );
}
