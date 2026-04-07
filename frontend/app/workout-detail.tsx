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
import { Feather } from '@expo/vector-icons';
import { SetManager } from '@/components/ui/forms/SetManager';
import { apiClient } from '@/services/api';
import {
    getNextSetOrder,
    normalizeWorkoutExercisesFromApi,
} from '@/utils/workout-exercise';

type SetPerformanceStatus = 'pending' | 'equal' | 'improved' | 'decreased';

type SetWithPerformance = WorkoutSet & {
    performanceStatus?: SetPerformanceStatus;
};

type ExerciseWithPerformance = Omit<WorkoutExercise, 'sets'> & {
    sets: SetWithPerformance[];
};

/**
 * Compara o resultado executado com a meta/referência da série.
 *
 * Regra adotada:
 * - Melhorou: fez mais peso OU mais repetições
 * - Piorou: fez menos peso OU menos repetições
 * - Igual: mesmo peso e mesmas repetições
 *
 * Caso você queira uma regra mais rígida depois
 * (ex.: só melhora se ambos aumentarem), dá para trocar aqui.
 */
function getSetPerformanceStatus(params: {
    plannedWeight?: number | null;
    plannedReps?: number | null;
    actualWeight?: number | null;
    actualReps?: number | null;
    completed?: boolean;
}): SetPerformanceStatus {
    const plannedWeight = params.plannedWeight ?? 0;
    const plannedReps = params.plannedReps ?? 0;
    const actualWeight = params.actualWeight ?? 0;
    const actualReps = params.actualReps ?? 0;
    const completed = params.completed ?? false;

    if (!completed) {
        return 'pending';
    }

    const sameWeight = actualWeight === plannedWeight;
    const sameReps = actualReps === plannedReps;

    if (sameWeight && sameReps) {
        return 'equal';
    }

    if (actualWeight > plannedWeight || actualReps > plannedReps) {
        return 'improved';
    }

    if (actualWeight < plannedWeight || actualReps < plannedReps) {
        return 'decreased';
    }

    return 'equal';
}

/**
 * Enriquecemos os sets com um status visual de performance.
 * Isso deixa a tela pronta para pintar cada linha no SetManager.
 */
function mapExercisesWithPerformance(
    workoutExercises: WorkoutExercise[]
): ExerciseWithPerformance[] {
    return workoutExercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({
            ...set,
            performanceStatus: getSetPerformanceStatus({
                plannedWeight: set.weight,
                plannedReps: set.reps,
                actualWeight: set.weight,
                actualReps: set.reps,
                completed: Boolean(set.completed),
            }),
        })),
    }));
}

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const { id } = useLocalSearchParams();
    const workoutId = id as string;

    const { workout, loading } = useWorkoutById(workoutId);
    const { deleteWorkout } = useWorkouts();

    const [exercises, setExercises] = useState<ExerciseWithPerformance[]>([]);

    /**
     * Sincroniza os exercícios vindos do hook principal
     * com a estrutura usada na tela de execução.
     */
    useEffect(() => {
        setExercises(mapExercisesWithPerformance(workout?.workoutExercises ?? []));
    }, [workout]);

    /**
     * Recarrega os exercícios no backend após alterações.
     * Fazemos isso para manter a tela sempre alinhada ao dado persistido.
     */
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

        const normalized = normalizeWorkoutExercisesFromApi(workoutExercises);
        setExercises(mapExercisesWithPerformance(normalized));
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

    /**
     * Atualiza uma série concluída com os valores reais executados.
     *
     * A ideia da tela agora é:
     * - usuário termina a série
     * - ajusta peso/reps reais
     * - a UI recalcula o status visual da performance
     */
    const handleUpdateSet = async (
        exerciseId: string,
        setId: string,
        updates: Partial<WorkoutSet>
    ) => {
        const payload: {
            order?: number;
            reps?: number | null;
            weight?: number | null;
            completed?: boolean;
        } = {};

        if (updates.order !== undefined) payload.order = updates.order;
        if (updates.reps !== undefined) payload.reps = updates.reps;
        if (updates.weight !== undefined) payload.weight = updates.weight;
        if (updates.completed !== undefined) payload.completed = updates.completed;

        /**
         * Atualização otimista local:
         * isso ajuda o usuário a ver imediatamente a mudança de cor/ícone.
         */
        setExercises((currentExercises) =>
            currentExercises.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,
                    sets: exercise.sets.map((set) => {
                        if (set.id !== setId) {
                            return set;
                        }

                        const nextSet = { ...set, ...updates };

                        return {
                            ...nextSet,
                            performanceStatus: getSetPerformanceStatus({
                                plannedWeight: set.weight,
                                plannedReps: set.reps,
                                actualWeight: nextSet.weight,
                                actualReps: nextSet.reps,
                                completed: Boolean(nextSet.completed),
                            }),
                        };
                    }),
                };
            })
        );

        if (Object.keys(payload).length === 0) {
            return;
        }

        try {
            await apiClient.updateSet(exerciseId, setId, payload);
            await refreshExercises();
        } catch (error) {
            console.error('Update set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel atualizar a serie agora.');
            await refreshExercises();
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

                <View className="flex-1">
                    {exercises.map((workoutExercise) => (
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
                                /**
                                 * O SetManager agora pode usar:
                                 * - set.completed
                                 * - set.performanceStatus
                                 *
                                 * Para definir:
                                 * - cor da linha
                                 * - ícone de sucesso / igual / queda
                                 * - comportamento ao finalizar a série
                                 */
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
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
