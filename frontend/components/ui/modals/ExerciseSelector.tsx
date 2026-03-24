import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    FlatList,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Exercise } from '@/hooks/useExerciseManager';

interface ExerciseSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelectExercise: (exercise: Exercise) => void;
    exercises: Exercise[];
}

export function ExerciseSelector({
    visible,
    onClose,
    onSelectExercise,
    exercises,
}: ExerciseSelectorProps) {
    const [search, setSearch] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

    const muscles = Array.from(
        new Set(
            exercises
                .map((exercise) => exercise.targetMuscle)
                .filter((muscle): muscle is string => Boolean(muscle))
        )
    ).sort();

    const filteredExercises = exercises.filter((e) => {
        const matchesSearch = e.name
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesMuscle =
            !selectedMuscle || e.targetMuscle === selectedMuscle;
        return matchesSearch && matchesMuscle;
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-[#000000]">
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-6 pb-4">
                    <Text className="text-white font-firs-bold text-2xl flex-1">
                        Exercícios
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 rounded-full bg-[#161618] items-center justify-center"
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color="#8E8E93"
                        />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="px-5 pb-5">
                    <View className="bg-[#161618] rounded-2xl flex-row items-center px-4 h-14">
                        <MaterialCommunityIcons
                            name="magnify"
                            size={22}
                            color="#8E8E93"
                        />
                        <TextInput
                            className="flex-1 text-white ml-3 font-firs-regular text-base"
                            placeholder="Buscar exercício..."
                            placeholderTextColor="#8E8E93"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {/* Muscle Filter */}
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-5 mb-5"
                        contentContainerStyle={{ gap: 10, paddingRight: 40 }}
                    >
                        <TouchableOpacity
                            className={`px-5 py-2.5 rounded-full ${selectedMuscle === null
                                    ? 'bg-[#FF6B00]'
                                    : 'bg-[#161618]'
                                }`}
                            onPress={() => setSelectedMuscle(null)}
                        >
                            <Text
                                className={`font-firs-bold text-sm ${selectedMuscle === null
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
                                className={`px-5 py-2.5 rounded-full ${selectedMuscle === muscle
                                        ? 'bg-[#FF6B00]'
                                        : 'bg-[#161618]'
                                    }`}
                                onPress={() => setSelectedMuscle(muscle)}
                            >
                                <Text
                                    className={`font-firs-bold text-sm ${selectedMuscle === muscle
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

                {/* Exercise List */}
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}
                    showsVerticalScrollIndicator={false}
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
                                        {item.targetMuscle}
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

                            {/* Ícone de Adicionar seguindo o padrão dos botões do kit */}
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
