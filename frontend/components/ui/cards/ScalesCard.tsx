import React from 'react';
import { Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function WeightCard() {
  const totalTicks = 17;
  const middleIndex = Math.floor(totalTicks / 2);

  return (
    <View className="relative h-full w-full items-center overflow-hidden rounded-[36px] border-[15px] border-surface bg-surface p-2">
      <Text className="mt-2 text-xs font-firs-regular text-foreground">
        Hoje, Março 12
      </Text>

      <Text
        className="mt-3 text-[60px] font-firs-medium leading-[50px] text-brand-primary"
        style={{ textAlignVertical: 'center' }}
      >
        86.4
      </Text>

      <View className="mb-10 flex-1 flex-row items-center justify-center opacity-60">
        <FontAwesome5 name="flag-checkered" size={10} color="#FFFFFF" />
        <Text className="ml-1.5 text-xs font-firs-regular text-foreground">
          16.4 kg até a meta
        </Text>
      </View>

      <View className="absolute bottom-[-30px] h-[60px] w-full items-center justify-end">
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
                className={`rounded-full ${
                  isCenter ? 'bg-brand-primary' : 'bg-surface-contrast'
                }`}
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
