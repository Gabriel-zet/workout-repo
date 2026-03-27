import type { WorkoutExercise, WorkoutSet } from '@/types/workout-exercise';

type ApiSet = {
    id: string;
    order?: number | null;
    reps?: number | null;
    weight?: string | number | null;
    completed?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type ApiExercise = {
    id?: string;
    name?: string;
    description?: string;
    targetMuscle?: string;
    equipment?: string;
    createdAt?: string;
    userId?: number;
};

type ApiWorkoutExercise = {
    id: string;
    order?: number | null;
    notes?: string | null;
    exerciseId?: string;
    createdAt?: string;
    updatedAt?: string;
    exercise?: ApiExercise;
    sets?: ApiSet[];
};

function toNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : 0;
    }

    return 0;
}

export function normalizeWorkoutSetFromApi(
    set: ApiSet,
    fallbackOrder: number
): WorkoutSet {
    return {
        id: set.id,
        order: set.order ?? fallbackOrder,
        reps: set.reps ?? 0,
        weight: toNumber(set.weight),
        completed: set.completed ?? false,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
    };
}

export function normalizeWorkoutExerciseFromApi(
    workoutExercise: ApiWorkoutExercise,
    fallbackIndex: number = 0
): WorkoutExercise {
    const exerciseId =
        workoutExercise.exerciseId ||
        workoutExercise.exercise?.id ||
        `exercise-${fallbackIndex + 1}`;

    const sets = [...(workoutExercise.sets ?? [])]
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
        .map((set, index) => normalizeWorkoutSetFromApi(set, index + 1));

    return {
        id: workoutExercise.id,
        order: workoutExercise.order ?? fallbackIndex + 1,
        notes: workoutExercise.notes ?? null,
        exerciseId,
        createdAt: workoutExercise.createdAt,
        updatedAt: workoutExercise.updatedAt,
        exercise: {
            id: exerciseId,
            name: workoutExercise.exercise?.name ?? 'Exercicio',
            description: workoutExercise.exercise?.description,
            targetMuscle: workoutExercise.exercise?.targetMuscle,
            equipment: workoutExercise.exercise?.equipment,
            createdAt: workoutExercise.exercise?.createdAt,
            userId: workoutExercise.exercise?.userId,
        },
        sets,
    };
}

export function normalizeWorkoutExercisesFromApi(
    workoutExercises: ApiWorkoutExercise[] = []
): WorkoutExercise[] {
    return workoutExercises.map((workoutExercise, index) =>
        normalizeWorkoutExerciseFromApi(workoutExercise, index)
    );
}

export function getNextSetOrder(sets: WorkoutSet[]): number {
    return (
        sets.reduce((highestOrder, set) => {
            return Math.max(highestOrder, set.order ?? 0);
        }, 0) + 1
    );
}
