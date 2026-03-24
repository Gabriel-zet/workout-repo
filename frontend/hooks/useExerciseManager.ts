import { useState, useCallback } from 'react';
import type {
    Exercise,
    WorkoutExercise,
    WorkoutSet as Set,
} from '@/types/workout-exercise';

export type { Exercise, WorkoutExercise, Set };

const MOCK_EXERCISES: Exercise[] = [
    {
        id: '1',
        name: 'Supino Reto',
        targetMuscle: 'Peito',
        equipment: 'Halteres',
        description: 'Exercicio de empurrar deitado',
    },
    {
        id: '2',
        name: 'Rosca Direta',
        targetMuscle: 'Biceps',
        equipment: 'Barra',
        description: 'Flexao de cotovelo com barra',
    },
    {
        id: '3',
        name: 'Agachamento',
        targetMuscle: 'Pernas',
        equipment: 'Barra Olimpica',
        description: 'Flexao de joelhos com carga',
    },
    {
        id: '4',
        name: 'Levantamento Terra',
        targetMuscle: 'Costas',
        equipment: 'Barra Olimpica',
        description: 'Puxada do chao ate a cintura',
    },
    {
        id: '5',
        name: 'Barra Paralela',
        targetMuscle: 'Triceps',
        equipment: 'Barra Paralela',
        description: 'Mergulho em barras paralelas',
    },
    {
        id: '6',
        name: 'Abdomen Maquina',
        targetMuscle: 'Abdomen',
        equipment: 'Maquina',
        description: 'Flexao de abdomen na maquina',
    },
];

function normalizeSet(set: Set, index: number): Set {
    return {
        ...set,
        order: set.order ?? index + 1,
        reps: Number.isFinite(set.reps) ? set.reps : 0,
        weight: Number.isFinite(set.weight) ? set.weight : 0,
        completed: set.completed ?? false,
    };
}

function normalizeWorkoutExercise(
    workoutExercise: WorkoutExercise,
    index: number
): WorkoutExercise {
    const normalizedExerciseId =
        workoutExercise.exerciseId ||
        workoutExercise.exercise?.id ||
        `${workoutExercise.exercise.name}-${index}`;

    return {
        ...workoutExercise,
        order: workoutExercise.order ?? index + 1,
        exerciseId: normalizedExerciseId,
        exercise: {
            ...workoutExercise.exercise,
            id: workoutExercise.exercise.id || normalizedExerciseId,
        },
        sets: workoutExercise.sets.map((set, setIndex) =>
            normalizeSet(set, setIndex)
        ),
    };
}

export function useExerciseManager() {
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    const getAvailableExercises = useCallback(() => {
        return MOCK_EXERCISES;
    }, []);

    const replaceExercises = useCallback((nextExercises: WorkoutExercise[]) => {
        setExercises(
            nextExercises.map((workoutExercise, index) =>
                normalizeWorkoutExercise(workoutExercise, index)
            )
        );
    }, []);

    const addExercise = useCallback((exercise: Exercise, notes?: string) => {
        let createdWorkoutExercise: WorkoutExercise | null = null;

        setExercises((prev) => {
            const newWorkoutExercise: WorkoutExercise = {
                id: `we-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                order: prev.length + 1,
                exerciseId: exercise.id,
                exercise,
                sets: [],
                notes,
            };

            createdWorkoutExercise = newWorkoutExercise;
            return [...prev, newWorkoutExercise];
        });

        return createdWorkoutExercise;
    }, []);

    const removeExercise = useCallback((exerciseId: string) => {
        setExercises((prev) =>
            prev
                .filter((exercise) => exercise.id !== exerciseId)
                .map((exercise, index) => ({
                    ...exercise,
                    order: index + 1,
                }))
        );
    }, []);

    const updateExerciseNotes = useCallback((exerciseId: string, notes: string) => {
        setExercises((prev) =>
            prev.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, notes } : exercise
            )
        );
    }, []);

    const addSet = useCallback((exerciseId: string, reps: number, weight: number) => {
        setExercises((prev) =>
            prev.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                const newSet: Set = {
                    id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    order: exercise.sets.length + 1,
                    reps,
                    weight,
                    completed: false,
                };

                return {
                    ...exercise,
                    sets: [...exercise.sets, newSet],
                };
            })
        );
    }, []);

    const updateSet = useCallback(
        (exerciseId: string, setId: string, updates: Partial<Set>) => {
            setExercises((prev) =>
                prev.map((exercise) => {
                    if (exercise.id !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                            set.id === setId
                                ? normalizeSet({ ...set, ...updates }, (set.order ?? 1) - 1)
                                : set
                        ),
                    };
                })
            );
        },
        []
    );

    const removeSet = useCallback((exerciseId: string, setId: string) => {
        setExercises((prev) =>
            prev.map((exercise) => {
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
            })
        );
    }, []);

    const clearAllExercises = useCallback(() => {
        setExercises([]);
    }, []);

    const getTotalVolume = useCallback(() => {
        return exercises.reduce((total, exercise) => {
            const exerciseVolume = exercise.sets.reduce((sum, set) => {
                return sum + set.weight * set.reps;
            }, 0);

            return total + exerciseVolume;
        }, 0);
    }, [exercises]);

    const getTotalSets = useCallback(() => {
        return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    }, [exercises]);

    return {
        exercises,
        getAvailableExercises,
        replaceExercises,
        addExercise,
        removeExercise,
        updateExerciseNotes,
        addSet,
        updateSet,
        removeSet,
        clearAllExercises,
        getTotalVolume,
        getTotalSets,
    };
}
