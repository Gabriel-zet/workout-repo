import { useState, useEffect, useCallback } from 'react';

export interface Exercise {
    id: string;
    name: string;
    createdAt: string;
    userId: number;
}

// Mock de exercícios
const MOCK_EXERCISES: Exercise[] = [
    {
        id: 'ex-1',
        name: 'Supino Reto',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-2',
        name: 'Rosca Direta',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-3',
        name: 'Agachamento',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-4',
        name: 'Rosca Inversa',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-5',
        name: 'Cross Over',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-6',
        name: 'Leg Press',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-7',
        name: 'Extensão de Quadríceps',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
    {
        id: 'ex-8',
        name: 'Flexão de Perna',
        createdAt: new Date().toISOString(),
        userId: 1,
    },
];

interface UseExercisesReturn {
    exercises: Exercise[];
    loading: boolean;
    error: string | null;
}

export function useExercises(): UseExercisesReturn {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Simular carregamento
        const timer = setTimeout(() => {
            setExercises(MOCK_EXERCISES);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return {
        exercises,
        loading,
        error: null,
    };
}
