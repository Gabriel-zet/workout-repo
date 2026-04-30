import React from 'react';
import { Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function WaterCard() {
  const totalBars = 12;
  const filledBars = 7;

  return (
    <View className="h-full w-full rounded-[36px] border border-outline-subtle bg-surface p-6">
      <View className="flex-row items-center">
        <FontAwesome5 name="glass-whiskey" size={12} color="#FFFFFF" />
        <Text className="ml-2.5 text-sm font-firs-regular text-foreground">
          Água diária
        </Text>
      </View>

      <View className="flex-row items-center">
        <Text className="mr-2.5 text-[50px] font-firs-medium text-brand-primary">
          1.5
        </Text>

        <View className="flex-col justify-center">
          <View className="mb-1 flex-row items-center self-start rounded-full bg-success-soft px-2.5 py-0.5">
            <FontAwesome5 name="arrow-up" size={10} color="#A6FF00" />
            <Text className="ml-1 text-sm font-firs-medium text-success">
              900 ml
            </Text>
          </View>

          <Text className="text-base font-firs-regular text-foreground">
            /2.5 Litros
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row justify-between rounded-xl bg-surface-muted px-3 py-2">
        {Array.from({ length: totalBars }).map((_, index) => {
          const isFilled = index < filledBars;
          return (
            <View
              key={index}
              className={`h-[26px] w-[5px] rounded-full ${
                isFilled ? 'bg-brand-primary' : 'bg-brand-soft'
              }`}
            />
          );
        })}
      </View>

      <View className="flex-row items-center justify-center opacity-60">
        <FontAwesome5 name="flag-checkered" size={12} color="#FFFFFF" />
        <Text className="ml-2.5 text-sm font-firs-regular text-foreground">
          1 litro até a meta
        </Text>
      </View>
    </View>
  );
}
