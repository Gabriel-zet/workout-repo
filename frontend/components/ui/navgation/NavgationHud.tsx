import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfilePhoto } from '@/hooks/useProfilePhoto';

type NavigationHudProps = {
    selectedDate: Date;
};

function getDayName(date: Date): string {
    const day = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
    });

    return day.charAt(0).toUpperCase() + day.slice(1);
}

export default function NavigationHud({ selectedDate }: NavigationHudProps) {
    const insets = useSafeAreaInsets();
    const { photoUri } = useProfilePhoto();

    return (
        <View className="px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
            <View className="flex-row items-center justify-between">
                <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-2xl border border-outline-subtle bg-surface-muted">
                    <MaterialIcons name="drag-handle" size={32} color="white" />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="text-foreground text-2xl font-firs-semibold tracking-tight">
                        {getDayName(selectedDate)}
                    </Text>

                    <Text className="mt-1 text-sm font-firs-regular text-foreground-subtle">
                        Push - peso por lado
                    </Text>
                </View>

                <TouchableOpacity className="relative">
                    {photoUri ? (
                        <Image
                            source={{ uri: photoUri }}
                            className="h-14 w-14 rounded-full bg-surface-muted"
                        />
                    ) : (
                        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                            <MaterialIcons
                                name="person"
                                size={28}
                                color="white"
                            />
                        </View>
                    )}
                    <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-canvas bg-brand-primary" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
