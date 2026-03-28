import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Set } from '@/hooks/useExerciseManager';

interface LoadEditorProps {
    visible: boolean;
    exerciseName: string;
    sets: Set[];
    onClose: () => void;
    onUpdateSet: (setId: string, reps: number, weight: number) => void;
    onAddSet: (reps: number, weight: number) => void;
    onRemoveSet: (setId: string) => void;
}

export function LoadEditor({
    visible,
    exerciseName,
    sets,
    onClose,
    onUpdateSet,
    onAddSet,
    onRemoveSet,
}: LoadEditorProps) {
    const [newReps, setNewReps] = useState('10');
    const [newWeight, setNewWeight] = useState('50');
    const [editingSetId, setEditingSetId] = useState<string | null>(null);
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');

    const handleAddSet = () => {
        const reps = parseInt(newReps) || 0;
        const weight = parseFloat(newWeight) || 0;

        if (reps > 0 && weight > 0) {
            onAddSet(reps, weight);
            setNewReps('10');
            setNewWeight('50');
        } else {
            Alert.alert('Erro', 'Preencha valores válidos');
        }
    };

    const handleStartEdit = (set: Set) => {
        setEditingSetId(set.id);
        setEditReps(set.reps.toString());
        setEditWeight(set.weight.toString());
    };

    const handleSaveEdit = () => {
        if (editingSetId) {
            const reps = parseInt(editReps) || 0;
            const weight = parseFloat(editWeight) || 0;

            if (reps > 0 && weight > 0) {
                onUpdateSet(editingSetId, reps, weight);
                setEditingSetId(null);
            } else {
                Alert.alert('Erro', 'Preencha valores válidos');
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-[#09090b]">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-zinc-800">
                    <View className="flex-1">
                        <Text className="text-white font-firs-bold text-lg">
                            Editar Cargas
                        </Text>
                        <Text className="text-zinc-400 font-firs-regular text-sm">
                            {exerciseName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <FlatList
                    data={sets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        editingSetId === item.id ? (
                            // Editing Mode
                            <View className="px-4 py-4 bg-zinc-800/50 mx-4 my-2 rounded-lg">
                                <View className="flex-row items-center gap-3 mb-4">
                                    <View className="bg-brand-primary rounded-full w-8 h-8 items-center justify-center">
                                        <Text className="text-zinc-900 font-firs-bold text-sm">
                                            {index + 1}
                                        </Text>
                                    </View>
                                    <Text className="text-white font-firs-bold flex-1">
                                        Série {index + 1}
                                    </Text>
                                </View>

                                <View className="gap-3 bg-zinc-900 rounded-lg p-4 mb-4">
                                    <View>
                                        <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                            Repetições
                                        </Text>
                                        <TextInput
                                            className="bg-zinc-800 text-white rounded-lg px-4 py-3 font-firs-regular border border-brand-primary"
                                            placeholder="Reps"
                                            keyboardType="number-pad"
                                            value={editReps}
                                            onChangeText={setEditReps}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                            Peso (kg)
                                        </Text>
                                        <TextInput
                                            className="bg-zinc-800 text-white rounded-lg px-4 py-3 font-firs-regular border border-brand-primary"
                                            placeholder="Peso"
                                            keyboardType="decimal-pad"
                                            value={editWeight}
                                            onChangeText={setEditWeight}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        className="flex-1 bg-zinc-700 rounded-lg py-3"
                                        onPress={() => setEditingSetId(null)}
                                    >
                                        <Text className="text-white font-firs-bold text-center">
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 bg-brand-primary rounded-lg py-3"
                                        onPress={handleSaveEdit}
                                    >
                                        <Text className="text-zinc-900 font-firs-bold text-center">
                                            Salvar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // View Mode
                            <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View className="bg-zinc-700 rounded-full w-8 h-8 items-center justify-center">
                                        <Text className="text-white font-firs-bold text-sm">
                                            {index + 1}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-firs-bold">
                                            {item.reps} reps × {item.weight}kg
                                        </Text>
                                        {item.completed && (
                                            <View className="flex-row items-center gap-1">
                                                <MaterialCommunityIcons
                                                    name="check-circle"
                                                    size={12}
                                                    color="#10b981"
                                                />
                                                <Text className="text-green-600 font-firs-regular text-xs">
                                                    Concluída
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        className="bg-brand-primary/20 rounded-lg px-3 py-2"
                                        onPress={() => handleStartEdit(item)}
                                    >
                                        <MaterialCommunityIcons
                                            name="pencil"
                                            size={16}
                                            color="#A6FF00"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="bg-red-500/20 rounded-lg px-3 py-2"
                                        onPress={() => onRemoveSet(item.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name="delete"
                                            size={16}
                                            color="#FF6B6B"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    )}
                    ListHeaderComponent={
                        <View className="px-4 pt-4">
                            <Text className="text-white font-firs-bold text-base mb-4">
                                Séries Atuais ({sets.length})
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View className="px-4 py-6 border-t border-zinc-800">
                            <Text className="text-white font-firs-bold text-base mb-4">
                                Adicionar Série
                            </Text>
                            <View className="gap-3 bg-zinc-800 rounded-lg p-4 mb-4">
                                <View>
                                    <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                        Repetições
                                    </Text>
                                    <TextInput
                                        className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular"
                                        placeholder="10"
                                        keyboardType="number-pad"
                                        value={newReps}
                                        onChangeText={setNewReps}
                                    />
                                </View>
                                <View>
                                    <Text className="text-zinc-400 font-firs-regular text-sm mb-2">
                                        Peso (kg)
                                    </Text>
                                    <TextInput
                                        className="bg-zinc-900 text-white rounded-lg px-4 py-3 font-firs-regular"
                                        placeholder="50"
                                        keyboardType="decimal-pad"
                                        value={newWeight}
                                        onChangeText={setNewWeight}
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-brand-primary rounded-lg py-3 mt-2"
                                    onPress={handleAddSet}
                                >
                                    <Text className="text-zinc-900 font-firs-bold text-center">
                                        Adicionar Série
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    scrollEnabled={false}
                />
            </View>
        </Modal>
    );
}
