import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@/services/api';
import type { Exercise } from '@/types/workout-exercise';

interface UseExercisesReturn {
    exercises: Exercise[];
    loading: boolean;
    error: string | null;
    refetch: (options?: RefetchOptions) => Promise<void>;
    createExercise: (name: string) => Promise<Exercise>;
    deleteExercise: (id: string) => Promise<void>;
}

interface RefetchOptions {
    force?: boolean;
    staleOnly?: boolean;
}

export function useExercises(): UseExercisesReturn {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    const refetch = useCallback(async (options: RefetchOptions = {}) => {
        if (
            options.staleOnly &&
            hasLoadedRef.current &&
            apiClient.isExercisesCacheFresh()
        ) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getExercises({ force: options.force });
            setExercises(data);
            hasLoadedRef.current = true;
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar exercicios');
            console.error('Error fetching exercises:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetch({ staleOnly: true }).catch(() => undefined);
        }, [refetch])
    );

    const createExercise = useCallback(async (name: string) => {
        try {
            setError(null);
            const createdExercise = await apiClient.createExercise(name.trim());
            setExercises((prev) =>
                [...prev, createdExercise].sort((a, b) => a.name.localeCompare(b.name))
            );
            hasLoadedRef.current = true;
            return createdExercise;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao criar exercicio';
            setError(errorMsg);
            throw err;
        }
    }, []);

    const deleteExercise = useCallback(async (id: string) => {
        try {
            setError(null);
            await apiClient.deleteExercise(id);
            setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
            hasLoadedRef.current = true;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao remover exercicio';
            setError(errorMsg);
            throw err;
        }
    }, []);

    return {
        exercises,
        loading,
        error,
        refetch,
        createExercise,
        deleteExercise,
    };
}
