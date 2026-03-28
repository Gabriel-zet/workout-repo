import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WheelPickerModal } from '../modals/WheelPickerModal';

export interface Set {
    id: string;
    reps: number;
    weight: number;
}

interface SetManagerProps {
    sets: Set[];
    onAddSet: (reps: number, weight: number) => void;
    onUpdateSet: (setId: string, updates: Partial<Set>) => void;
    onRemoveSet: (setId: string) => void;
}

export function SetManager({ sets, onAddSet, onUpdateSet, onRemoveSet }: SetManagerProps) {
    const [pickerConfig, setPickerConfig] = useState<{
        visible: boolean;
        type: 'weight' | 'reps';
        setId: string | null;
        initialValue: number;
    }>({ visible: false, type: 'weight', setId: null, initialValue: 0 });

    const openPicker = (type: 'weight' | 'reps', val: number, id: string) => {
        setPickerConfig({ visible: true, type, setId: id, initialValue: val });
    };

    const handleConfirmPicker = (value: number) => {
        if (pickerConfig.setId) {
            onUpdateSet(pickerConfig.setId, { [pickerConfig.type]: value });
        }
        setPickerConfig(prev => ({ ...prev, visible: false }));
    };

    return (
        <View className="w-full">
            {sets.map((item, index) => (
                <View key={item.id} className="flex-row items-center justify-between mb-4">
                    {/* Número da Série */}
                    <View className="w-10 h-10 bg-zinc-800/50 rounded-full items-center justify-center">
                        <Text className="text-white font-firs-medium">{index + 1}</Text>
                    </View>

                    {/* Botão Peso */}
                    <TouchableOpacity
                        onPress={() => openPicker('weight', item.weight, item.id)}
                        className="flex-row items-center bg-zinc-800/50 rounded-2xl px-4 h-11 w-[100px] justify-center"
                    >
                        <Text className="text-white font-firs-bold mr-1">{item.weight}</Text>
                        <Text className="text-zinc-500 text-xs">kg</Text>
                    </TouchableOpacity>

                    <MaterialCommunityIcons name="close" size={14} color="#3f3f46" />

                    {/* Botão Reps */}
                    <TouchableOpacity
                        onPress={() => openPicker('reps', item.reps, item.id)}
                        className="flex-row items-center bg-zinc-800/50 rounded-2xl px-4 h-11 w-[105px] justify-center"
                    >
                        <Text className="text-white font-firs-bold mr-1">{item.reps}</Text>
                        <Text className="text-zinc-500 text-xs">reps</Text>
                    </TouchableOpacity>

                    {/* Check/Remover */}
                    <TouchableOpacity
                        onLongPress={() => onRemoveSet(item.id)}
                        className="w-10 h-10 bg-zinc-800/50 rounded-full items-center justify-center"
                    >
                        <MaterialCommunityIcons name="check" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity
                onPress={() => onAddSet(10, 0)}
                className="flex-row items-center mt-2 opacity-50"
            >
                <MaterialCommunityIcons name="plus" size={20} color="white" />
                <Text className="text-white ml-2 font-firs-medium">Adicionar série</Text>
            </TouchableOpacity>

            {/* O FILHO SENDO CHAMADO AQUI */}
            <WheelPickerModal
                visible={pickerConfig.visible}
                type={pickerConfig.type}
                title={pickerConfig.type === 'weight' ? 'Kilos' : 'Repetições'}
                initialValue={pickerConfig.initialValue}
                onClose={() => setPickerConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={handleConfirmPicker}
            />
        </View>
    );
}