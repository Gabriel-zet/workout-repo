import { useState, useCallback } from 'react';
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

async function getWorkoutExercisesByWorkoutOrEmpty(workoutId: string) {
    try {
        return await apiClient.getWorkoutExercisesByWorkout(workoutId);
    } catch (err: any) {
        if (err?.status === 404) {
            return [];
        }

        throw err;
    }
}

async function attachWorkoutExercisesToWorkout<T extends Workout>(workout: T): Promise<T> {
    const workoutExercises =
        workout.workoutExercises ?? (await getWorkoutExercisesByWorkoutOrEmpty(workout.id));

    return {
        ...workout,
        workoutExercises: normalizeWorkoutExercisesFromApi(workoutExercises),
    };
}

interface UseWorkoutsReturn {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createWorkout: (date: Date, title: string, notes?: string) => Promise<Workout>;
    deleteWorkout: (id: string) => Promise<void>;
    updateWorkout: (id: string, updates: Partial<Workout>) => Promise<Workout>;
}

export function useWorkouts(): UseWorkoutsReturn {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getWorkouts();
            const workoutsWithExercises = await Promise.all(
                (data || []).map((workout) => attachWorkoutExercisesToWorkout(workout))
            );
            setWorkouts(workoutsWithExercises);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar treinos');
            console.error('Error fetching workouts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetch().catch(() => undefined);
        }, [refetch])
    );

    const createWorkout = useCallback(
        async (date: Date, title: string, notes?: string): Promise<Workout> => {
            try {
                setError(null);
                const newWorkout = await apiClient.createWorkout(date, title, notes);
                const workoutWithExercises = await attachWorkoutExercisesToWorkout(newWorkout);
                setWorkouts((prev) => [...prev, workoutWithExercises]);
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
                const workoutWithExercises = await attachWorkoutExercisesToWorkout(updated);

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
    refetch: () => Promise<void>;
}

export function useWorkoutById(workoutId: string): UseWorkoutByIdReturn {
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!workoutId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getWorkoutById(workoutId);
            const workoutWithExercises = await attachWorkoutExercisesToWorkout(data);
            setWorkout(workoutWithExercises);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar treino');
            console.error('Error fetching workout:', err);
        } finally {
            setLoading(false);
        }
    }, [workoutId]);

    useFocusEffect(
        useCallback(() => {
            refetch().catch(() => undefined);
        }, [refetch])
    );

    return {
        workout,
        loading,
        error,
        refetch,
    };
}
