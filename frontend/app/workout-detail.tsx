import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    useWorkoutById,
    useWorkouts,
    WorkoutExercise,
    Set as WorkoutSet,
} from '@/hooks/useWorkouts';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SetManager } from '@/components/ui/forms/SetManager';
import { parseStoredDate } from '@/utils/date';
import { apiClient } from '@/services/api';
import {
    getNextSetOrder,
    normalizeWorkoutExercisesFromApi,
} from '@/utils/workout-exercise';

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const { id } = useLocalSearchParams();
    const workoutId = id as string;
    const { workout, loading } = useWorkoutById(workoutId);
    const { deleteWorkout } = useWorkouts();

    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    useEffect(() => {
        setExercises(workout?.workoutExercises ?? []);
    }, [workout]);

    const refreshExercises = useCallback(async () => {
        if (!workoutId) return;

        const workoutExercises = await apiClient
            .getWorkoutExercisesByWorkout(workoutId)
            .catch((error: any) => {
                if (error?.status === 404) {
                    return [];
                }

                throw error;
            });

        setExercises(normalizeWorkoutExercisesFromApi(workoutExercises));
    }, [workoutId]);

    const handleDelete = () => {
        Alert.alert('Deletar Treino', 'Tem certeza que deseja deletar este treino?', [
            { text: 'Cancelar', onPress: () => undefined },
            {
                text: 'Deletar',
                onPress: async () => {
                    try {
                        await deleteWorkout(workoutId);
                        Alert.alert('Sucesso', 'Treino deletado com sucesso');
                        router.back();
                    } catch (error) {
                        console.error('Delete workout failed:', error);
                        Alert.alert('Erro', 'Falha ao deletar treino');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    const handleUpdateSet = async (
        exerciseId: string,
        setId: string,
        updates: Partial<WorkoutSet>
    ) => {
        const payload: {
            order?: number;
            reps?: number | null;
            weight?: number | null;
        } = {};

        if (updates.order !== undefined) payload.order = updates.order;
        if (updates.reps !== undefined) payload.reps = updates.reps;
        if (updates.weight !== undefined) payload.weight = updates.weight;

        if (Object.keys(payload).length === 0) {
            setExercises((currentExercises) =>
                currentExercises.map((exercise) => {
                    if (exercise.id !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                            set.id === setId ? { ...set, ...updates } : set
                        ),
                    };
                })
            );
            return;
        }

        try {
            await apiClient.updateSet(exerciseId, setId, payload);
            await refreshExercises();
        } catch (error) {
            console.error('Update set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel atualizar a serie agora.');
        }
    };

    const handleAddSet = async (exerciseId: string, reps: number, weight: number) => {
        const currentExercise = exercises.find((exercise) => exercise.id === exerciseId);

        if (!currentExercise) {
            return;
        }

        try {
            await apiClient.createSet(exerciseId, {
                order: getNextSetOrder(currentExercise.sets),
                reps,
                weight,
            });
            await refreshExercises();
        } catch (error) {
            console.error('Create set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel adicionar a serie agora.');
        }
    };

    const handleRemoveSet = async (exerciseId: string, setId: string) => {
        const currentExercise = exercises.find((exercise) => exercise.id === exerciseId);

        if (!currentExercise) {
            return;
        }

        const remainingSets = currentExercise.sets.filter((set) => set.id !== setId);

        try {
            await apiClient.deleteSet(exerciseId, setId);

            for (const [index, set] of remainingSets.entries()) {
                const nextOrder = index + 1;

                if ((set.order ?? nextOrder) === nextOrder) {
                    continue;
                }

                await apiClient.updateSet(exerciseId, set.id, { order: nextOrder });
            }

            await refreshExercises();
        } catch (error) {
            console.error('Delete set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel remover a serie agora.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b]">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-lg font-firs-medium">
                        Treino nao encontrado
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 bg-orange-600 rounded-lg px-6 py-3"
                    >
                        <Text className="text-white font-firs-bold">Voltar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const workoutDate = parseStoredDate(workout.date);
    const formattedDate = workoutDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const totalSets = exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
    const completedSets = exercises.reduce(
        (acc, exercise) => acc + exercise.sets.filter((set) => set.completed).length,
        0
    );
    const totalVolume = exercises.reduce((acc, exercise) => {
        return (
            acc +
            exercise.sets.reduce((setAcc, set) => {
                return setAcc + set.weight * set.reps;
            }, 0)
        );
    }, 0);
    const completionRate = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: headerHeight + 24,
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-zinc-500 font-firs-regular text-lg">
                                {formattedDate}
                            </Text>
                            <Text className="text-white text-4xl font-firs-bold p-0 mt-2">
                                {workout.title}
                            </Text>
                            {workout.notes && (
                                <Text className="text-zinc-500 font-firs-regular text-lg mt-2">
                                    {workout.notes}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: '/create-workout',
                                        params: { id: workoutId },
                                    })
                                }
                                className="w-11 h-11 bg-white/10 rounded-full items-center justify-center"
                            >
                                <Feather name="edit-2" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="w-11 h-11 bg-red-500/10 rounded-full items-center justify-center"
                            >
                                <Feather name="trash-2" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3 mb-8">
                    <View className="flex-1 bg-[#121212] rounded-[24px] p-4">
                        <Text className="text-zinc-500 font-firs-regular text-sm mb-2">
                            Total de Series
                        </Text>
                        <Text className="text-white text-2xl font-firs-bold">
                            {totalSets}
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#121212] rounded-[24px] p-4">
                        <Text className="text-zinc-500 font-firs-regular text-sm mb-2">
                            Conclusao
                        </Text>
                        <Text className="text-green-500 text-2xl font-firs-bold">
                            {completionRate}%
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#121212] rounded-[24px] p-4">
                        <Text className="text-zinc-500 font-firs-regular text-sm mb-2">
                            Volume Total
                        </Text>
                        <Text className="text-orange-500 text-2xl font-firs-bold">
                            {totalVolume}kg
                        </Text>
                    </View>
                </View>

                <View className="flex-1">
                    <Text className="text-white font-firs-bold text-lg tracking-tight mb-4">
                        Exercicios ({exercises.length})
                    </Text>

                    {exercises.map((workoutExercise) => {
                        const exerciseVolume = workoutExercise.sets.reduce(
                            (acc, set) => acc + set.weight * set.reps,
                            0
                        );

                        return (
                            <View
                                key={workoutExercise.id}
                                className="bg-[#121212] rounded-[32px] mb-4 overflow-hidden p-6"
                            >
                                <View className="flex-row justify-between items-start mb-6">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-zinc-400 font-firs-regular text-base mb-1">
                                            {workoutExercise.exercise.targetMuscle || 'Exercicio'}
                                        </Text>

                                        <Text className="text-white font-firs-medium text-xl leading-tight mb-2">
                                            {workoutExercise.exercise.name}
                                        </Text>

                                        <Text className="text-zinc-600 font-firs-regular text-sm">
                                            {workoutExercise.sets.length} serie
                                            {workoutExercise.sets.length === 1 ? '' : 's'}
                                        </Text>

                                        {workoutExercise.notes ? (
                                            <Text className="text-zinc-500 font-firs-regular text-sm mt-2">
                                                {workoutExercise.notes}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
                                        <Text className="text-white font-firs-bold text-base">
                                            {workoutExercise.order ?? 0}
                                        </Text>
                                    </View>
                                </View>

                                <SetManager
                                    sets={workoutExercise.sets}
                                    onAddSet={(reps, weight) => {
                                        handleAddSet(workoutExercise.id, reps, weight).catch(
                                            () => undefined
                                        );
                                    }}
                                    onUpdateSet={(setId, updates) => {
                                        handleUpdateSet(
                                            workoutExercise.id,
                                            setId,
                                            updates
                                        ).catch(() => undefined);
                                    }}
                                    onRemoveSet={(setId) => {
                                        handleRemoveSet(workoutExercise.id, setId).catch(
                                            () => undefined
                                        );
                                    }}
                                />

                                <View className="mt-6 pt-5 border-t border-zinc-800/80 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-zinc-500 font-firs-regular text-sm mb-1">
                                            Volume do exercicio
                                        </Text>
                                        <Text className="text-orange-500 font-firs-bold text-base">
                                            {exerciseVolume.toFixed(0)}kg
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={16}
                                            color="#10b981"
                                        />
                                        <Text className="text-zinc-500 font-firs-regular text-sm ml-2">
                                            {workoutExercise.sets.filter((set) => set.completed).length}
                                            /{workoutExercise.sets.length} concluidas
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View className="bg-[#121212] rounded-[32px] p-6 mt-2">
                        <Text className="text-white font-firs-bold text-lg mb-2">
                            Resumo do Treino
                        </Text>
                        <Text className="text-zinc-500 font-firs-regular text-base">
                            {exercises.length} exercicio
                            {exercises.length === 1 ? '' : 's'} registrados com {totalSets}{' '}
                            series no total.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
