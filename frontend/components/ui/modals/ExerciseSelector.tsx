import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '@/constants/theme';
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
                <View className="items-center px-6 py-20">
                    <ActivityIndicator size="large" color={theme.colors.brand} />
                    <Text className="mt-4 font-firs-regular text-foreground-muted">
                        Carregando exercícios...
                    </Text>
                </View>
            );
        }

        const emptyMessage =
            exercises.length === 0
                ? 'Nenhum exercício cadastrado ainda.'
                : 'Nenhum exercício encontrado para esse filtro.';

        return (
            <View className="items-center px-6 py-20">
                <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
                    <MaterialCommunityIcons
                        name="dumbbell"
                        size={28}
                        color={theme.colors.brand}
                    />
                </View>
                <Text className="text-center text-lg font-firs-bold text-foreground">
                    {emptyMessage}
                </Text>
                <Text className="mt-2 text-center text-sm font-firs-regular text-foreground-muted">
                    {exercises.length === 0
                        ? 'Crie alguns exercícios para montar seu treino.'
                        : 'Tente buscar por outro nome ou limpar o filtro.'}
                </Text>
                {onManageExercises && (
                    <TouchableOpacity
                        onPress={onManageExercises}
                        className="mt-6 flex-row items-center rounded-2xl bg-brand-primary px-5 py-3"
                    >
                        <MaterialCommunityIcons
                            name="plus"
                            size={18}
                            color={theme.colors.textInverse}
                        />
                        <Text className="ml-2 font-firs-bold text-foreground-inverse">
                            Gerenciar exercícios
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
            <View className="flex-1 bg-canvas">
                <View className="flex-row items-center justify-between px-5 pb-4 pt-6">
                    <Text className="flex-1 text-2xl font-firs-bold text-foreground">
                        Exercícios
                    </Text>

                    {onManageExercises && (
                        <TouchableOpacity
                            onPress={onManageExercises}
                            className="mr-3 h-10 flex-row items-center rounded-full bg-surface-muted px-4"
                        >
                            <MaterialCommunityIcons
                                name="plus"
                                size={18}
                                color={theme.colors.brand}
                            />
                            <Text className="ml-2 font-firs-medium text-foreground">
                                Novo
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={onClose}
                        className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={theme.colors.textSubtle}
                        />
                    </TouchableOpacity>
                </View>

                <View className="px-5 pb-5">
                    <View className="h-14 flex-row items-center rounded-2xl bg-surface-muted px-4">
                        <MaterialCommunityIcons
                            name="magnify"
                            size={22}
                            color={theme.colors.textSubtle}
                        />
                        <TextInput
                            className="ml-3 flex-1 text-base font-firs-regular text-foreground"
                            placeholder="Buscar exercício..."
                            placeholderTextColor={theme.colors.textSubtle}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {muscles.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-5 px-5"
                        contentContainerStyle={{ gap: 10, paddingRight: 40 }}
                    >
                        <TouchableOpacity
                            className={`rounded-full px-5 py-2.5 ${selectedMuscle === null
                                ? 'bg-brand-primary'
                                : 'bg-surface-muted'
                                }`}
                            onPress={() => setSelectedMuscle(null)}
                        >
                            <Text
                                className={`text-sm font-firs-bold ${selectedMuscle === null
                                    ? 'text-foreground-inverse'
                                    : 'text-foreground-subtle'
                                    }`}
                            >
                                Todos
                            </Text>
                        </TouchableOpacity>

                        {muscles.map((muscle) => (
                            <TouchableOpacity
                                key={muscle}
                                className={`rounded-full px-5 py-2.5 ${selectedMuscle === muscle
                                    ? 'bg-brand-primary'
                                    : 'bg-surface-muted'
                                    }`}
                                onPress={() => setSelectedMuscle(muscle)}
                            >
                                <Text
                                    className={`text-sm font-firs-bold ${selectedMuscle === muscle
                                        ? 'text-foreground-inverse'
                                        : 'text-foreground-subtle'
                                        }`}
                                >
                                    {muscle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
                            className="mb-3 flex-row items-center justify-between p-4 bg-surface rounded-2xl"
                            activeOpacity={0.7}
                            onPress={() => {
                                onSelectExercise(item);
                                onClose();
                            }}
                        >
                            <View className="flex-1 pr-4">
                                <Text className="mb-1.5 text-base font-firs-bold text-foreground">
                                    {item.name}
                                </Text>
                                <View className="flex-row items-center gap-3">
                                    <Text className="text-sm font-firs-medium text-foreground-subtle">
                                        {item.targetMuscle || 'Catálogo pessoal'}
                                    </Text>
                                    {item.equipment && (
                                        <>
                                            <View className="h-1 w-1 rounded-full bg-outline-strong" />
                                            <Text className="text-sm font-firs-regular text-foreground-subtle">
                                                {item.equipment}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={22}
                                    color={theme.colors.textSubtle}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
}

