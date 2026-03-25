import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@/services/api';
import type { Exercise } from '@/types/workout-exercise';

interface UseExercisesReturn {
    exercises: Exercise[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createExercise: (name: string) => Promise<Exercise>;
    deleteExercise: (id: string) => Promise<void>;
}

export function useExercises(): UseExercisesReturn {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getExercises();
            setExercises(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar exercicios');
            console.error('Error fetching exercises:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetch().catch(() => undefined);
        }, [refetch])
    );

    const createExercise = useCallback(async (name: string) => {
        try {
            setError(null);
            const createdExercise = await apiClient.createExercise(name.trim());
            setExercises((prev) =>
                [...prev, createdExercise].sort((a, b) => a.name.localeCompare(b.name))
            );
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
