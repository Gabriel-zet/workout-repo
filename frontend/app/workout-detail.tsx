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
    ensureExerciseWeightHistory,
    getExercisePerformanceTrend,
    getExerciseWeightHistoryMap,
    removeExerciseWeightHistorySet,
    saveExerciseWeightHistory,
    type ExerciseSetWeightEntry,
    type ExerciseWeightEntry,
} from '@/services/exercise-weight-history';
import theme from '@/constants/theme';
import {
    getNextSetOrder,
    normalizeWorkoutExercisesFromApi,
} from '@/utils/workout-exercise';

const DEBUG_PREFIX = '[workout-detail]';

type SetPerformanceStatus = 'pending' | 'new' | 'equal' | 'improved' | 'decreased';

type SetWithPerformance = WorkoutSet & {
    performanceStatus?: SetPerformanceStatus;
};

type ExerciseWithPerformance = Omit<WorkoutExercise, 'sets'> & {
    sets: SetWithPerformance[];
};

type ExerciseWeightHistoryState = Record<string, ExerciseWeightEntry>;

function isCompleteSetHistoryEntry(
    historyEntry: ExerciseSetWeightEntry | undefined
): historyEntry is ExerciseSetWeightEntry {
    if (!historyEntry) {
        return false;
    }

    return (
        Number.isFinite(historyEntry.currentWeight) &&
        Number.isFinite(historyEntry.currentReps)
    );
}

function findSetHistoryEntry(
    exerciseHistory: ExerciseWeightEntry | undefined,
    set: WorkoutSet,
    fallbackOrder: number
): ExerciseSetWeightEntry | undefined {
    if (!exerciseHistory) {
        return undefined;
    }

    const directEntry = exerciseHistory.sets[set.id];

    if (isCompleteSetHistoryEntry(directEntry)) {
        return directEntry;
    }

    return Object.values(exerciseHistory.sets).find(
        (entry) =>
            isCompleteSetHistoryEntry(entry) &&
            entry.setOrder === (set.order ?? fallbackOrder)
    );
}

function getSetPerformanceStatus(params: {
    currentWeight?: number | null;
    currentReps?: number | null;
    historyEntry?: ExerciseSetWeightEntry;
}): SetPerformanceStatus {
    const currentWeight = params.currentWeight ?? 0;
    const currentReps = params.currentReps ?? 0;
    const historyEntry = params.historyEntry;

    if (!historyEntry) {
        return 'pending';
    }

    const comparisonTrend = getExercisePerformanceTrend({
        currentWeight,
        currentReps,
        previousWeight: historyEntry.currentWeight,
        previousReps: historyEntry.currentReps,
    });

    if (comparisonTrend === 'equal') {
        if (
            historyEntry.previousWeight === null ||
            historyEntry.previousReps === null ||
            historyEntry.trend === 'new'
        ) {
            return 'new';
        }

        if (historyEntry.trend === 'increased') {
            return 'improved';
        }

        if (historyEntry.trend === 'decreased') {
            return 'decreased';
        }

        return 'equal';
    }

    if (comparisonTrend === 'increased') {
        return 'improved';
    }

    if (comparisonTrend === 'decreased') {
        return 'decreased';
    }

    return historyEntry.previousWeight === null || historyEntry.previousReps === null
        ? 'new'
        : 'equal';
}

function mapExercisesWithPerformance(
    workoutExercises: WorkoutExercise[],
    historyMap: ExerciseWeightHistoryState = {}
): ExerciseWithPerformance[] {
    return workoutExercises.map((exercise) => {
        const exerciseHistory = historyMap[exercise.id];

        return {
            ...exercise,
            sets: exercise.sets.map((set, index) => ({
                ...set,
                performanceStatus: getSetPerformanceStatus({
                    currentWeight: set.weight,
                    currentReps: set.reps,
                    historyEntry: findSetHistoryEntry(exerciseHistory, set, index + 1),
                }),
            })),
        };
    });
}

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const { id } = useLocalSearchParams();
    const workoutId = id as string;

    const { workout, loading } = useWorkoutById(workoutId);
    const { deleteWorkout } = useWorkouts({ autoFetch: false });

    const [exercises, setExercises] = useState<ExerciseWithPerformance[]>([]);
    const [exerciseWeightHistory, setExerciseWeightHistory] =
        useState<ExerciseWeightHistoryState>({});

    const loadExerciseWeightHistory = useCallback(
        async (workoutExercises: WorkoutExercise[]): Promise<ExerciseWeightHistoryState> => {
            if (workoutExercises.length === 0) {
                console.log(`${DEBUG_PREFIX} no exercises available to load set history`);
                return {};
            }

            console.log(
                `${DEBUG_PREFIX} loading set history for workout exercises:`,
                workoutExercises.map((exercise) => ({
                    workoutExerciseId: exercise.id,
                    exerciseId: exercise.exerciseId,
                    exerciseName: exercise.exercise.name,
                    sets: exercise.sets.length,
                }))
            );

            const historyMap = await getExerciseWeightHistoryMap(
                workoutExercises.map((exercise) => exercise.id)
            );
            const nextHistoryMap: ExerciseWeightHistoryState = { ...historyMap };

            for (const workoutExercise of workoutExercises) {
                for (const [index, set] of workoutExercise.sets.entries()) {
                    const setOrder = set.order ?? index + 1;
                    const directSetHistory = nextHistoryMap[workoutExercise.id]?.sets?.[set.id];

                    if (isCompleteSetHistoryEntry(directSetHistory)) {
                        console.log(
                            `${DEBUG_PREFIX} local history already exists for set:`,
                            set.id,
                            directSetHistory
                        );
                        continue;
                    }

                    console.log(`${DEBUG_PREFIX} seeding set history if needed:`, {
                        workoutExerciseId: workoutExercise.id,
                        setId: set.id,
                        setOrder,
                        weight: set.weight,
                        reps: set.reps,
                    });

                    nextHistoryMap[workoutExercise.id] =
                        await ensureExerciseWeightHistory({
                            workoutExerciseId: workoutExercise.id,
                            exerciseId: workoutExercise.exerciseId,
                            exerciseName: workoutExercise.exercise.name,
                            setId: set.id,
                            setOrder,
                            weight: set.weight,
                            reps: set.reps,
                        });
                }
            }

            console.log(`${DEBUG_PREFIX} loaded set history map:`, nextHistoryMap);
            return nextHistoryMap;
        },
        []
    );

    const persistExerciseWeightHistory = useCallback(
        async (params: {
            workoutExercise: ExerciseWithPerformance;
            setId: string;
            setOrder: number;
            weight: number;
            reps: number;
        }) => {
            console.log(`${DEBUG_PREFIX} persisting set weight change:`, params);

            const nextEntry = await saveExerciseWeightHistory({
                workoutExerciseId: params.workoutExercise.id,
                exerciseId: params.workoutExercise.exerciseId,
                exerciseName: params.workoutExercise.exercise.name,
                setId: params.setId,
                setOrder: params.setOrder,
                weight: params.weight,
                reps: params.reps,
            });

            console.log(`${DEBUG_PREFIX} local set weight saved:`, nextEntry);
            setExerciseWeightHistory((currentHistory) => ({
                ...currentHistory,
                [params.workoutExercise.id]: nextEntry,
            }));
        },
        []
    );

    useEffect(() => {
        const baseExercises = workout?.workoutExercises ?? [];
        let isActive = true;

        console.log(`${DEBUG_PREFIX} syncing workout exercises from hook:`, {
            workoutId,
            exerciseCount: baseExercises.length,
        });

        setExercises(mapExercisesWithPerformance(baseExercises));

        loadExerciseWeightHistory(baseExercises)
            .then((nextHistory) => {
                if (!isActive) {
                    return;
                }

                console.log(`${DEBUG_PREFIX} applying loaded local set history`);
                setExerciseWeightHistory(nextHistory);
                setExercises(mapExercisesWithPerformance(baseExercises, nextHistory));
            })
            .catch((error) => {
                console.error('Failed to load local exercise weight history:', error);
            });

        return () => {
            isActive = false;
        };
    }, [loadExerciseWeightHistory, workout, workoutId]);

    const refreshExercises = useCallback(async () => {
        if (!workoutId) return;

        console.log(`${DEBUG_PREFIX} refreshing exercises from API for workout:`, workoutId);

        const workoutExercises = await apiClient
            .getWorkoutExercisesByWorkout(workoutId, { force: true })
            .catch((error: any) => {
                if (error?.status === 404) {
                    return [];
                }

                throw error;
            });

        const normalized = normalizeWorkoutExercisesFromApi(workoutExercises);
        const nextHistory = await loadExerciseWeightHistory(normalized);

        console.log(`${DEBUG_PREFIX} refresh completed:`, {
            workoutId,
            exerciseCount: normalized.length,
        });

        setExerciseWeightHistory(nextHistory);
        setExercises(mapExercisesWithPerformance(normalized, nextHistory));
    }, [loadExerciseWeightHistory, workoutId]);

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
        workoutExerciseId: string,
        setId: string,
        updates: Partial<WorkoutSet>
    ) => {
        const currentExercise = exercises.find((exercise) => exercise.id === workoutExerciseId);

        if (!currentExercise) {
            return;
        }

        const currentSet = currentExercise.sets.find((set) => set.id === setId);

        if (!currentSet) {
            return;
        }

        const historyEntry = findSetHistoryEntry(
            exerciseWeightHistory[workoutExerciseId],
            currentSet,
            currentSet.order ?? 1
        );

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

        setExercises((currentExercises) =>
            currentExercises.map((exercise) => {
                if (exercise.id !== workoutExerciseId) {
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
                                currentWeight: nextSet.weight,
                                currentReps: nextSet.reps,
                                historyEntry,
                            }),
                        };
                    }),
                };
            })
        );

        if (Object.keys(payload).length === 0) {
            console.log(`${DEBUG_PREFIX} skipping set update because payload is empty`, {
                workoutExerciseId,
                setId,
            });
            return;
        }

        try {
            console.log(`${DEBUG_PREFIX} updating set on API:`, {
                workoutExerciseId,
                setId,
                payload,
            });

            await apiClient.updateSet(workoutExerciseId, setId, payload);

            if (
                (payload.weight !== undefined && payload.weight !== null) ||
                (payload.reps !== undefined && payload.reps !== null)
            ) {
                await persistExerciseWeightHistory({
                    workoutExercise: currentExercise,
                    setId,
                    setOrder: updates.order ?? currentSet.order ?? 1,
                    weight: payload.weight ?? currentSet.weight,
                    reps: payload.reps ?? currentSet.reps,
                });
            }

        } catch (error) {
            console.error('Update set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel atualizar a serie agora.');
            await refreshExercises();
        }
    };

    const handleAddSet = async (
        workoutExerciseId: string,
        reps: number,
        weight: number
    ) => {
        const currentExercise = exercises.find((exercise) => exercise.id === workoutExerciseId);

        if (!currentExercise) {
            return;
        }

        const nextSetOrder = getNextSetOrder(currentExercise.sets);

        try {
            console.log(`${DEBUG_PREFIX} creating set on API:`, {
                workoutExerciseId,
                reps,
                weight,
                nextSetOrder,
            });

            const createdSet = await apiClient.createSet(workoutExerciseId, {
                order: nextSetOrder,
                reps,
                weight,
            });

            await persistExerciseWeightHistory({
                workoutExercise: currentExercise,
                setId: createdSet.id,
                setOrder: createdSet.order ?? nextSetOrder,
                weight,
                reps,
            });

            await refreshExercises();
        } catch (error) {
            console.error('Create set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel adicionar a serie agora.');
        }
    };

    const handleRemoveSet = async (workoutExerciseId: string, setId: string) => {
        const currentExercise = exercises.find((exercise) => exercise.id === workoutExerciseId);

        if (!currentExercise) {
            return;
        }

        const remainingSets = currentExercise.sets.filter((set) => set.id !== setId);

        try {
            console.log(`${DEBUG_PREFIX} removing set from API:`, {
                workoutExerciseId,
                setId,
                remainingSets: remainingSets.length,
            });

            await apiClient.deleteSet(workoutExerciseId, setId);
            await removeExerciseWeightHistorySet({
                workoutExerciseId,
                setId,
            });

            for (const [index, set] of remainingSets.entries()) {
                const nextOrder = index + 1;

                if ((set.order ?? nextOrder) === nextOrder) {
                    continue;
                }

                await apiClient.updateSet(workoutExerciseId, set.id, { order: nextOrder });
            }

            await refreshExercises();
        } catch (error) {
            console.error('Delete set failed:', error);
            Alert.alert('Ops!', 'Nao foi possivel remover a serie agora.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView
                className="flex-1 bg-canvas justify-center items-center"
                edges={['left', 'right', 'bottom']}
            >
                <ActivityIndicator size="large" color={theme.colors.brand} />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right', 'bottom']}>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-foreground text-lg font-firs-medium">
                        Treino nao encontrado
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 rounded-lg bg-brand-primary px-6 py-3"
                    >
                        <Text className="font-firs-bold text-foreground-inverse">Voltar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-canvas pt-14" edges={['left', 'right', 'bottom']}>
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
                            <Text className="text-foreground text-4xl font-firs-bold p-0 mt-2">
                                {workout.title}
                            </Text>

                            {workout.notes && (
                                <Text className="text-foreground-muted font-firs-regular text-lg mt-2">
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
                                className="w-11 h-11 bg-surface-muted rounded-full items-center justify-center"
                            >
                                <Feather name="edit-2" size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                className="w-11 h-11 bg-danger-soft rounded-full items-center justify-center"
                            >
                                <Feather name="trash-2" size={18} color={theme.colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex-1">
                    {exercises.map((workoutExercise) => (
                        <View
                            key={workoutExercise.id}
                            className="bg-surface rounded-[32px] border border-outline-subtle mb-4 overflow-hidden"
                        >
                            <View className="flex-row justify-between items-start p-6">
                                <View className="flex-1 pr-4">
                                    <Text className="text-foreground-muted font-firs-regular text-base mb-1">
                                        {workoutExercise.exercise.targetMuscle || 'Exercicio'}
                                    </Text>

                                    <Text className="text-foreground font-firs-medium text-xl leading-tight mb-2">
                                        {workoutExercise.exercise.name}
                                    </Text>

                                    <Text className="text-foreground-subtle font-firs-regular text-sm">
                                        {workoutExercise.sets.length} serie
                                        {workoutExercise.sets.length === 1 ? '' : 's'}
                                    </Text>

                                    {workoutExercise.notes ? (
                                        <Text className="text-foreground-muted font-firs-regular text-sm mt-2">
                                            {workoutExercise.notes}
                                        </Text>
                                    ) : null}
                                </View>

                                <View className="w-12 h-12 bg-surface-muted rounded-full items-center justify-center">
                                    <Text className="text-foreground font-firs-bold text-base">
                                        {workoutExercise.order ?? 0}
                                    </Text>
                                </View>
                            </View>

                            <View className="mb-6">
                                <SetManager
                                    sets={workoutExercise.sets}
                                    showAddButton={false}
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
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
