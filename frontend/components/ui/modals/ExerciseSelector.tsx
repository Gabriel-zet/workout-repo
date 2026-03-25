import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    FlatList,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Exercise } from '@/types/workout-exercise';

interface ExerciseSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelectExercise: (exercise: Exercise) => void;
    exercises: Exercise[];
    loading?: boolean;
    onManageExercises?: () => void;
}

export function ExerciseSelector({
    visible,
    onClose,
    onSelectExercise,
    exercises,
    loading = false,
    onManageExercises,
}: ExerciseSelectorProps) {
    const [search, setSearch] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

    const muscles = useMemo(() => {
        return Array.from(
            new Set(
                exercises
                    .map((exercise) => exercise.targetMuscle)
                    .filter((muscle): muscle is string => Boolean(muscle))
            )
        ).sort();
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        return exercises.filter((exercise) => {
            const matchesSearch = exercise.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesMuscle =
                !selectedMuscle || exercise.targetMuscle === selectedMuscle;

            return matchesSearch && matchesMuscle;
        });
    }, [exercises, search, selectedMuscle]);

    const renderEmptyState = () => {
        if (loading) {
            return (
                <View className="px-6 py-20 items-center">
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text className="text-zinc-400 font-firs-regular mt-4">
                        Carregando exercicios...
                    </Text>
                </View>
            );
        }

        const emptyMessage =
            exercises.length === 0
                ? 'Nenhum exercicio cadastrado ainda.'
                : 'Nenhum exercicio encontrado para esse filtro.';

        return (
            <View className="px-6 py-20 items-center">
                <View className="w-16 h-16 rounded-full bg-[#161618] items-center justify-center mb-5">
                    <MaterialCommunityIcons name="dumbbell" size={28} color="#FF6B00" />
                </View>
                <Text className="text-white font-firs-bold text-lg text-center">
                    {emptyMessage}
                </Text>
                <Text className="text-zinc-400 font-firs-regular text-sm text-center mt-2">
                    {exercises.length === 0
                        ? 'Crie alguns exercicios para montar seu treino.'
                        : 'Tente buscar por outro nome ou limpar o filtro.'}
                </Text>
                {onManageExercises && (
                    <TouchableOpacity
                        onPress={onManageExercises}
                        className="mt-6 bg-[#FF6B00] rounded-2xl px-5 py-3 flex-row items-center"
                    >
                        <MaterialCommunityIcons name="plus" size={18} color="#09090b" />
                        <Text className="text-[#09090b] font-firs-bold ml-2">
                            Gerenciar Exercicios
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-[#000000]">
                <View className="flex-row items-center justify-between px-5 pt-6 pb-4">
                    <Text className="text-white font-firs-bold text-2xl flex-1">
                        Exercicios
                    </Text>

                    {onManageExercises && (
                        <TouchableOpacity
                            onPress={onManageExercises}
                            className="mr-3 px-4 h-10 rounded-full bg-[#161618] flex-row items-center"
                        >
                            <MaterialCommunityIcons name="plus" size={18} color="#FF6B00" />
                            <Text className="text-white font-firs-medium ml-2">Novo</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 rounded-full bg-[#161618] items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                <View className="px-5 pb-5">
                    <View className="bg-[#161618] rounded-2xl flex-row items-center px-4 h-14">
                        <MaterialCommunityIcons name="magnify" size={22} color="#8E8E93" />
                        <TextInput
                            className="flex-1 text-white ml-3 font-firs-regular text-base"
                            placeholder="Buscar exercicio..."
                            placeholderTextColor="#8E8E93"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {muscles.length > 0 && (
                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-5 mb-5"
                            contentContainerStyle={{ gap: 10, paddingRight: 40 }}
                        >
                            <TouchableOpacity
                                className={`px-5 py-2.5 rounded-full ${
                                    selectedMuscle === null ? 'bg-[#FF6B00]' : 'bg-[#161618]'
                                }`}
                                onPress={() => setSelectedMuscle(null)}
                            >
                                <Text
                                    className={`font-firs-bold text-sm ${
                                        selectedMuscle === null
                                            ? 'text-white'
                                            : 'text-[#8E8E93]'
                                    }`}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {muscles.map((muscle) => (
                                <TouchableOpacity
                                    key={muscle}
                                    className={`px-5 py-2.5 rounded-full ${
                                        selectedMuscle === muscle
                                            ? 'bg-[#FF6B00]'
                                            : 'bg-[#161618]'
                                    }`}
                                    onPress={() => setSelectedMuscle(muscle)}
                                >
                                    <Text
                                        className={`font-firs-bold text-sm ${
                                            selectedMuscle === muscle
                                                ? 'text-white'
                                                : 'text-[#8E8E93]'
                                        }`}
                                    >
                                        {muscle}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-[#161618] rounded-[20px] p-4 mb-3 flex-row items-center justify-between"
                            activeOpacity={0.7}
                            onPress={() => {
                                onSelectExercise(item);
                                onClose();
                            }}
                        >
                            <View className="flex-1 pr-4">
                                <Text className="text-white font-firs-bold text-base mb-1.5">
                                    {item.name}
                                </Text>
                                <View className="flex-row items-center gap-3">
                                    <Text className="text-[#8E8E93] font-firs-medium text-sm">
                                        {item.targetMuscle || 'Catalogo pessoal'}
                                    </Text>
                                    {item.equipment && (
                                        <>
                                            <View className="w-1 h-1 rounded-full bg-[#48484A]" />
                                            <Text className="text-[#8E8E93] font-firs-regular text-sm">
                                                {item.equipment}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View className="w-10 h-10 rounded-full bg-[#252528] items-center justify-center">
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={22}
                                    color="#FF6B00"
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
}
