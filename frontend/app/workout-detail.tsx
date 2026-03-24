import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutById, useWorkouts, WorkoutExercise } from '@/hooks/useWorkouts';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LoadEditor } from '@/components/ui/modals/LoadEditor';
import { parseStoredDate } from '@/utils/date';
import { saveWorkoutExercises } from '@/services/workout-exercise-storage';

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const workoutId = id as string;
    const { workout, loading } = useWorkoutById(workoutId);
    const { deleteWorkout } = useWorkouts();

    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    useEffect(() => {
        setExercises(workout?.workoutExercises ?? []);
    }, [workout]);

    const persistExercises = async (nextExercises: WorkoutExercise[]) => {
        if (!workoutId) return;
        await saveWorkoutExercises(workoutId, nextExercises);
    };

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
        reps: number,
        weight: number
    ) => {
        const nextExercises = exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
                return exercise;
            }

            return {
                ...exercise,
                sets: exercise.sets.map((set) =>
                    set.id === setId ? { ...set, reps, weight } : set
                ),
            };
        });

        setExercises(nextExercises);
        await persistExercises(nextExercises);
    };

    const handleAddSet = async (exerciseId: string, reps: number, weight: number) => {
        const nextExercises = exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
                return exercise;
            }

            return {
                ...exercise,
                sets: [
                    ...exercise.sets,
                    {
                        id: `set-${Date.now()}`,
                        order: exercise.sets.length + 1,
                        reps,
                        weight,
                        completed: false,
                    },
                ],
            };
        });

        setExercises(nextExercises);
        await persistExercises(nextExercises);
    };

    const handleRemoveSet = async (exerciseId: string, setId: string) => {
        const nextExercises = exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
                return exercise;
            }

            return {
                ...exercise,
                sets: exercise.sets
                    .filter((set) => set.id !== setId)
                    .map((set, index) => ({
                        ...set,
                        order: index + 1,
                    })),
            };
        });

        setExercises(nextExercises);
        await persistExercises(nextExercises);
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
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="px-6 py-6 border-b border-zinc-800">
                    <Text className="text-white text-3xl font-firs-bold mb-2">
                        {workout.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-4">
                        <MaterialCommunityIcons name="calendar" size={16} color="#71717a" />
                        <Text className="text-zinc-400 font-firs-regular">
                            {formattedDate}
                        </Text>
                    </View>
                    {workout.notes && (
                        <View className="bg-zinc-900 rounded-lg p-3.5">
                            <Text className="text-zinc-300 font-firs-regular text-sm">
                                {workout.notes}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="px-6 py-6">
                    <Text className="text-white text-xl font-firs-bold mb-4">
                        Exercicios ({exercises.length})
                    </Text>

                    {exercises.map((workoutExercise) => (
                        <View
                            key={workoutExercise.id}
                            className="bg-zinc-900 rounded-xl p-4 mb-4"
                        >
                            <View className="flex-row items-start justify-between mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="bg-orange-600 w-6 h-6 rounded-full items-center justify-center">
                                            <Text className="text-white text-xs font-firs-bold">
                                                {workoutExercise.order ?? 0}
                                            </Text>
                                        </View>
                                        <Text className="text-white text-lg font-firs-bold flex-shrink-1">
                                            {workoutExercise.exercise.name}
                                        </Text>
                                    </View>
                                    {workoutExercise.notes && (
                                        <Text className="text-zinc-400 text-sm font-firs-regular ml-8">
                                            {workoutExercise.notes}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    className="bg-orange-600/20 rounded-lg p-2"
                                    onPress={() => setEditingExerciseId(workoutExercise.id)}
                                >
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={16}
                                        color="#ea580c"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View className="border-t border-zinc-800 pt-4">
                                <View className="flex-row mb-3 px-2">
                                    <Text className="flex-1 text-zinc-500 text-xs font-firs-bold">
                                        SET
                                    </Text>
                                    <Text className="flex-1 text-zinc-500 text-xs font-firs-bold text-right">
                                        REPS
                                    </Text>
                                    <Text className="flex-1 text-zinc-500 text-xs font-firs-bold text-right">
                                        PESO
                                    </Text>
                                    <Text className="flex-[0.5] text-zinc-500 text-xs font-firs-bold text-right">
                                        OK
                                    </Text>
                                </View>

                                {workoutExercise.sets.map((set, index) => (
                                    <View
                                        key={set.id}
                                        className={`flex-row py-2 px-2 items-center ${
                                            index < workoutExercise.sets.length - 1
                                                ? 'border-b border-zinc-800'
                                                : ''
                                        }`}
                                    >
                                        <Text className="flex-1 text-zinc-300 font-firs-medium">
                                            {set.order ?? index + 1}
                                        </Text>
                                        <Text className="flex-1 text-white font-firs-bold text-right">
                                            {set.reps}
                                        </Text>
                                        <Text className="flex-1 text-orange-500 font-firs-bold text-right">
                                            {set.weight}kg
                                        </Text>
                                        <View className="flex-[0.5] items-center">
                                            {set.completed ? (
                                                <MaterialCommunityIcons
                                                    name="check-circle"
                                                    size={16}
                                                    color="#10b981"
                                                />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="circle-outline"
                                                    size={16}
                                                    color="#71717a"
                                                />
                                            )}
                                        </View>
                                    </View>
                                ))}

                                <View className="flex-row py-3 px-2 border-t border-orange-500/30 mt-2">
                                    <Text className="flex-1 text-orange-500 font-firs-bold">
                                        VOL.
                                    </Text>
                                    <Text className="flex-1 text-orange-500 font-firs-bold text-right">
                                        {workoutExercise.sets
                                            .reduce((acc, set) => acc + set.weight * set.reps, 0)
                                            .toFixed(0)}
                                        kg
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <View className="bg-zinc-900 rounded-xl p-6 mt-6">
                        <Text className="text-white text-lg font-firs-bold mb-4">
                            Resumo do Treino
                        </Text>
                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-zinc-400 text-sm font-firs-regular mb-2">
                                    Total de Series
                                </Text>
                                <Text className="text-white text-2xl font-firs-bold">
                                    {totalSets}
                                </Text>
                            </View>
                            <View className="flex-1 mr-4">
                                <Text className="text-zinc-400 text-sm font-firs-regular mb-2">
                                    Conclusao
                                </Text>
                                <Text className="text-green-500 text-2xl font-firs-bold">
                                    {completionRate}%
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-zinc-400 text-sm font-firs-regular mb-2">
                                    Volume Total
                                </Text>
                                <Text className="text-orange-500 text-2xl font-firs-bold">
                                    {totalVolume}kg
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="px-6 py-4 border-t border-zinc-800 gap-3">
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: '/create-workout',
                            params: { id: workoutId },
                        })
                    }
                    className="bg-orange-600 rounded-lg py-3.5 flex-row items-center justify-center gap-2"
                >
                    <Feather name="edit-2" size={18} color="white" />
                    <Text className="text-white font-firs-bold text-base">
                        Editar Treino
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDelete}
                    className="bg-zinc-900 rounded-lg py-3.5 flex-row items-center justify-center gap-2 border border-zinc-800"
                >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                    <Text className="text-red-500 font-firs-bold text-base">
                        Deletar Treino
                    </Text>
                </TouchableOpacity>
            </View>

            {editingExerciseId && (
                <LoadEditor
                    visible={!!editingExerciseId}
                    exerciseName={
                        exercises.find((exercise) => exercise.id === editingExerciseId)?.exercise
                            .name || ''
                    }
                    sets={
                        exercises.find((exercise) => exercise.id === editingExerciseId)?.sets.map(
                            (set) => ({
                                id: set.id,
                                reps: set.reps,
                                weight: set.weight,
                                completed: set.completed ?? false,
                            })
                        ) || []
                    }
                    onClose={() => setEditingExerciseId(null)}
                    onUpdateSet={(setId, reps, weight) => {
                        if (editingExerciseId) {
                            handleUpdateSet(editingExerciseId, setId, reps, weight).catch(
                                () => undefined
                            );
                        }
                    }}
                    onAddSet={(reps, weight) => {
                        if (editingExerciseId) {
                            handleAddSet(editingExerciseId, reps, weight).catch(
                                () => undefined
                            );
                        }
                    }}
                    onRemoveSet={(setId) => {
                        if (editingExerciseId) {
                            handleRemoveSet(editingExerciseId, setId).catch(() => undefined);
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
}
