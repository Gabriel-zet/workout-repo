export interface Exercise {
    id: string;
    name: string;
    description?: string;
    targetMuscle?: string;
    equipment?: string;
    createdAt?: string;
    userId?: number;
}

export interface WorkoutSet {
    id: string;
    order?: number;
    reps: number;
    weight: number;
    completed?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkoutExercise {
    id: string;
    order?: number;
    exerciseId: string;
    exercise: Exercise;
    sets: WorkoutSet[];
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
