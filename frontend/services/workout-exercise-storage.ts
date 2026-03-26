import { storage } from '@/services/storage';
import type { WorkoutExercise, WorkoutSet } from '@/types/workout-exercise';

type HydratableWorkout = {
    id: string;
    workoutExercises?: WorkoutExercise[];
};

const WORKOUT_EXERCISES_STORAGE_KEY = 'workout_exercises_by_workout';

type WorkoutExerciseMap = Record<string, WorkoutExercise[]>;

async function readWorkoutExerciseMap(): Promise<WorkoutExerciseMap> {
    const rawValue = await storage.getItem(WORKOUT_EXERCISES_STORAGE_KEY);

    if (!rawValue) {
        return {};
    }

    try {
        return JSON.parse(rawValue) as WorkoutExerciseMap;
    } catch (error) {
        console.warn('Failed to parse stored workout exercises, resetting cache', error);
        return {};
    }
}

async function writeWorkoutExerciseMap(value: WorkoutExerciseMap): Promise<void> {
    await storage.setItem(WORKOUT_EXERCISES_STORAGE_KEY, JSON.stringify(value));
}

function normalizeSet(set: WorkoutSet, index: number): WorkoutSet {
    const numericWeight =
        typeof set.weight === 'string' ? Number(set.weight) : set.weight;

    return {
        ...set,
        order: set.order ?? index + 1,
        reps: Number.isFinite(set.reps) ? set.reps : 0,
        weight: Number.isFinite(numericWeight) ? numericWeight : 0,
        completed: set.completed ?? false,
    };
}

function normalizeWorkoutExercises(
    workoutExercises: WorkoutExercise[] | undefined
): WorkoutExercise[] {
    return (workoutExercises ?? []).map((workoutExercise, exerciseIndex) => ({
        ...workoutExercise,
        order: workoutExercise.order ?? exerciseIndex + 1,
        notes: workoutExercise.notes ?? null,
        exerciseId:
            workoutExercise.exerciseId ||
            workoutExercise.exercise?.id ||
            `exercise-${exerciseIndex + 1}`,
        exercise: {
            ...workoutExercise.exercise,
            id:
                workoutExercise.exercise?.id ||
                workoutExercise.exerciseId ||
                `exercise-${exerciseIndex + 1}`,
        },
        sets: (workoutExercise.sets ?? []).map((set, setIndex) =>
            normalizeSet(set, setIndex)
        ),
    }));
}

function mergeWorkoutExercises(
    backendExercises: WorkoutExercise[],
    storedExercises: WorkoutExercise[]
): WorkoutExercise[] {
    if (backendExercises.length === 0) {
        return storedExercises;
    }

    return backendExercises.map((backendExercise, index) => {
        const storedExercise = storedExercises.find((candidate) => {
            if (candidate.id === backendExercise.id) {
                return true;
            }

            return (
                candidate.exerciseId === backendExercise.exerciseId &&
                (candidate.order ?? index + 1) === (backendExercise.order ?? index + 1)
            );
        });

        if (!storedExercise) {
            return backendExercise;
        }

        return {
            ...backendExercise,
            sets:
                storedExercise.sets.length > 0
                    ? storedExercise.sets
                    : backendExercise.sets,
        };
    });
}

function applyWorkoutExercises<T extends HydratableWorkout>(
    workout: T,
    workoutExerciseMap: WorkoutExerciseMap
): T {
    const backendExercises = normalizeWorkoutExercises(workout.workoutExercises);
    const storedExercises = normalizeWorkoutExercises(workoutExerciseMap[workout.id]);

    return {
        ...workout,
        workoutExercises: mergeWorkoutExercises(backendExercises, storedExercises),
    };
}

export async function getStoredWorkoutExercises(
    workoutId: string
): Promise<WorkoutExercise[]> {
    const workoutExerciseMap = await readWorkoutExerciseMap();
    return normalizeWorkoutExercises(workoutExerciseMap[workoutId]);
}

export async function saveWorkoutExercises(
    workoutId: string,
    workoutExercises: WorkoutExercise[]
): Promise<void> {
    const workoutExerciseMap = await readWorkoutExerciseMap();

    if (workoutExercises.length === 0) {
        delete workoutExerciseMap[workoutId];
        await writeWorkoutExerciseMap(workoutExerciseMap);
        return;
    }

    workoutExerciseMap[workoutId] = normalizeWorkoutExercises(workoutExercises);
    await writeWorkoutExerciseMap(workoutExerciseMap);
}

export async function removeStoredWorkoutExercises(workoutId: string): Promise<void> {
    const workoutExerciseMap = await readWorkoutExerciseMap();
    delete workoutExerciseMap[workoutId];
    await writeWorkoutExerciseMap(workoutExerciseMap);
}

export async function hydrateWorkout<T extends HydratableWorkout>(
    workout: T | null
): Promise<T | null> {
    if (!workout) {
        return null;
    }

    const workoutExerciseMap = await readWorkoutExerciseMap();
    return applyWorkoutExercises(workout, workoutExerciseMap);
}

export async function hydrateWorkouts<T extends HydratableWorkout>(
    workouts: T[]
): Promise<T[]> {
    const workoutExerciseMap = await readWorkoutExerciseMap();
    return workouts.map((workout) => applyWorkoutExercises(workout, workoutExerciseMap));
}
