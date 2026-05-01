import { useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../services/api';
import { removeStoredWorkoutExercises } from '@/services/workout-exercise-storage';
import type {
    Exercise,
    WorkoutExercise,
    WorkoutSet as Set,
} from '@/types/workout-exercise';
import { normalizeWorkoutExercisesFromApi } from '@/utils/workout-exercise';

export type { Exercise, WorkoutExercise, Set };

export interface Workout {
    id: string;
    date: string;
    title: string;
    notes?: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    workoutExercises?: WorkoutExercise[];
}

interface RefetchOptions {
    force?: boolean;
    staleOnly?: boolean;
}

interface UseWorkoutsOptions {
    autoFetch?: boolean;
}

async function getWorkoutExercisesByWorkoutOrEmpty(
    workoutId: string,
    options: RefetchOptions = {}
) {
    try {
        return await apiClient.getWorkoutExercisesByWorkout(workoutId, {
            force: options.force,
        });
    } catch (err: any) {
        if (err?.status === 404) {
            return [];
        }

        throw err;
    }
}

async function attachWorkoutExercisesToWorkout<T extends Workout>(
    workout: T,
    options: RefetchOptions = {}
): Promise<T> {
    const workoutExercises =
        workout.workoutExercises ??
        (await getWorkoutExercisesByWorkoutOrEmpty(workout.id, options));

    return {
        ...workout,
        workoutExercises: normalizeWorkoutExercisesFromApi(workoutExercises),
    };
}

interface UseWorkoutsReturn {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
    refetch: (options?: RefetchOptions) => Promise<void>;
    createWorkout: (date: Date, title: string, notes?: string) => Promise<Workout>;
    deleteWorkout: (id: string) => Promise<void>;
    updateWorkout: (id: string, updates: Partial<Workout>) => Promise<Workout>;
}

export function useWorkouts(options: UseWorkoutsOptions = {}): UseWorkoutsReturn {
    const { autoFetch = true } = options;
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    const refetch = useCallback(async (refetchOptions: RefetchOptions = {}) => {
        if (
            refetchOptions.staleOnly &&
            hasLoadedRef.current &&
            apiClient.isWorkoutsCacheFresh()
        ) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getWorkouts({ force: refetchOptions.force });
            const workoutsWithExercises = await Promise.all(
                (data || []).map((workout) =>
                    attachWorkoutExercisesToWorkout(workout, refetchOptions)
                )
            );
            setWorkouts(workoutsWithExercises);
            hasLoadedRef.current = true;
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar treinos');
            console.error('Error fetching workouts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!autoFetch) {
                return;
            }

            refetch({ staleOnly: true }).catch(() => undefined);
        }, [autoFetch, refetch])
    );

    const createWorkout = useCallback(
        async (date: Date, title: string, notes?: string): Promise<Workout> => {
            try {
                setError(null);
                const newWorkout = await apiClient.createWorkout(date, title, notes);
                const workoutWithExercises = await attachWorkoutExercisesToWorkout(newWorkout, {
                    force: true,
                });
                setWorkouts((prev) => [...prev, workoutWithExercises]);
                hasLoadedRef.current = true;
                return workoutWithExercises;
            } catch (err: any) {
                const errorMsg = err.message || 'Erro ao criar treino';
                setError(errorMsg);
                throw err;
            }
        },
        []
    );

    const deleteWorkout = useCallback(async (id: string) => {
        try {
            setError(null);
            await apiClient.deleteWorkout(id);
            await removeStoredWorkoutExercises(id);
            setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
            hasLoadedRef.current = true;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao deletar treino';
            setError(errorMsg);
            throw err;
        }
    }, []);

    const updateWorkout = useCallback(
        async (id: string, updates: Partial<Workout>): Promise<Workout> => {
            try {
                setError(null);
                const updated = await apiClient.updateWorkout(id, {
                    date: updates.date ? new Date(updates.date) : undefined,
                    title: updates.title,
                    notes: updates.notes,
                });
                const workoutWithExercises = await attachWorkoutExercisesToWorkout(updated, {
                    force: true,
                });

                setWorkouts((prev) =>
                    prev.map((workout) =>
                        workout.id === id ? workoutWithExercises : workout
                    )
                );

                return workoutWithExercises;
            } catch (err: any) {
                const errorMsg = err.message || 'Erro ao atualizar treino';
                setError(errorMsg);
                throw err;
            }
        },
        []
    );

    return {
        workouts,
        loading,
        error,
        refetch,
        createWorkout,
        deleteWorkout,
        updateWorkout,
    };
}

interface UseWorkoutByIdReturn {
    workout: Workout | null;
    loading: boolean;
    error: string | null;
    refetch: (options?: RefetchOptions) => Promise<void>;
}

export function useWorkoutById(workoutId: string): UseWorkoutByIdReturn {
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    const refetch = useCallback(async (refetchOptions: RefetchOptions = {}) => {
        if (!workoutId) return;

        if (
            refetchOptions.staleOnly &&
            hasLoadedRef.current &&
            apiClient.isWorkoutCacheFresh(workoutId)
        ) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getWorkoutById(workoutId, {
                force: refetchOptions.force,
            });
            const workoutWithExercises = await attachWorkoutExercisesToWorkout(
                data,
                refetchOptions
            );
            setWorkout(workoutWithExercises);
            hasLoadedRef.current = true;
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar treino');
            console.error('Error fetching workout:', err);
        } finally {
            setLoading(false);
        }
    }, [workoutId]);

    useFocusEffect(
        useCallback(() => {
            refetch({ staleOnly: true }).catch(() => undefined);
        }, [refetch])
    );

    return {
        workout,
        loading,
        error,
        refetch,
    };
}
