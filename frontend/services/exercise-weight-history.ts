import { storage } from '@/services/storage';

const EXERCISE_WEIGHT_HISTORY_STORAGE_KEY = 'exercise_weight_history_by_workout_exercise';
const DEBUG_PREFIX = '[exercise-weight-history]';

export type ExerciseWeightTrend = 'new' | 'equal' | 'increased' | 'decreased';

export interface ExerciseSetWeightEntry {
    setId: string;
    setOrder: number;
    currentWeight: number;
    currentReps: number;
    previousWeight: number | null;
    previousReps: number | null;
    trend: ExerciseWeightTrend;
    updatedAt: string;
}

export interface ExerciseWeightEntry {
    workoutExerciseId: string;
    exerciseId: string;
    exerciseName: string;
    sets: Record<string, ExerciseSetWeightEntry>;
    updatedAt: string;
}

type ExerciseWeightHistoryMap = Record<string, ExerciseWeightEntry>;

function hasCompleteSetHistoryEntry(
    entry: ExerciseSetWeightEntry | undefined
): entry is ExerciseSetWeightEntry {
    if (!entry) {
        return false;
    }

    return (
        Number.isFinite(entry.currentWeight) &&
        Number.isFinite(entry.currentReps)
    );
}

function normalizeWeight(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Number(value.toFixed(2));
}

function normalizeReps(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.trunc(value));
}

export function getExercisePerformanceTrend(params: {
    currentWeight: number;
    currentReps: number;
    previousWeight: number | null;
    previousReps: number | null;
}): ExerciseWeightTrend {
    const currentWeight = normalizeWeight(params.currentWeight);
    const currentReps = normalizeReps(params.currentReps);
    const previousWeight =
        params.previousWeight === null ? null : normalizeWeight(params.previousWeight);
    const previousReps =
        params.previousReps === null ? null : normalizeReps(params.previousReps);

    if (previousWeight === null || previousReps === null) {
        return 'new';
    }

    const sameWeight = currentWeight === previousWeight;
    const sameReps = currentReps === previousReps;

    if (sameWeight && sameReps) {
        return 'equal';
    }

    const currentVolume = currentWeight * currentReps;
    const previousVolume = previousWeight * previousReps;

    if (currentVolume > previousVolume) {
        return 'increased';
    }

    if (currentVolume < previousVolume) {
        return 'decreased';
    }

    if (currentWeight > previousWeight) {
        return 'increased';
    }

    if (currentWeight < previousWeight) {
        return 'decreased';
    }

    if (currentReps > previousReps) {
        return 'increased';
    }

    if (currentReps < previousReps) {
        return 'decreased';
    }

    return 'equal';
}

async function readExerciseWeightHistoryMap(): Promise<ExerciseWeightHistoryMap> {
    const rawValue = await storage.getItem(EXERCISE_WEIGHT_HISTORY_STORAGE_KEY);

    if (!rawValue) {
        console.log(`${DEBUG_PREFIX} no local history found`);
        return {};
    }

    try {
        const parsedValue = JSON.parse(rawValue) as ExerciseWeightHistoryMap;
        console.log(
            `${DEBUG_PREFIX} loaded local history entries:`,
            Object.keys(parsedValue).length
        );
        return parsedValue;
    } catch (error) {
        console.warn('Failed to parse stored exercise weight history, resetting cache', error);
        return {};
    }
}

async function writeExerciseWeightHistoryMap(
    value: ExerciseWeightHistoryMap
): Promise<void> {
    console.log(
        `${DEBUG_PREFIX} persisting local history entries:`,
        Object.keys(value).length
    );
    await storage.setItem(EXERCISE_WEIGHT_HISTORY_STORAGE_KEY, JSON.stringify(value));
}

function buildSetWeightEntry(params: {
    setId: string;
    setOrder: number;
    weight: number;
    reps: number;
    previousEntry?: ExerciseSetWeightEntry;
}): ExerciseSetWeightEntry {
    const currentWeight = normalizeWeight(params.weight);
    const currentReps = normalizeReps(params.reps);
    const previousWeight = params.previousEntry?.currentWeight ?? null;
    const previousReps = params.previousEntry?.currentReps ?? null;

    const trend = getExercisePerformanceTrend({
        currentWeight,
        currentReps,
        previousWeight,
        previousReps,
    });

    return {
        setId: params.setId,
        setOrder: params.setOrder,
        currentWeight,
        currentReps,
        previousWeight,
        previousReps,
        trend,
        updatedAt: new Date().toISOString(),
    };
}

export async function getExerciseWeightHistoryMap(
    workoutExerciseIds: string[]
): Promise<ExerciseWeightHistoryMap> {
    const historyMap = await readExerciseWeightHistoryMap();
    console.log(
        `${DEBUG_PREFIX} request history map for workout exercises:`,
        workoutExerciseIds
    );

    return workoutExerciseIds.reduce<ExerciseWeightHistoryMap>(
        (accumulator, workoutExerciseId) => {
            const entry = historyMap[workoutExerciseId];

            if (entry) {
                accumulator[workoutExerciseId] = entry;
            }

            return accumulator;
        },
        {}
    );
}

export async function saveExerciseWeightHistory(params: {
    workoutExerciseId: string;
    exerciseId: string;
    exerciseName: string;
    setId: string;
    setOrder: number;
    weight: number;
    reps: number;
}): Promise<ExerciseWeightEntry> {
    const historyMap = await readExerciseWeightHistoryMap();
    const currentEntry = historyMap[params.workoutExerciseId];

    console.log(`${DEBUG_PREFIX} saving weight history:`, params);

    const nextSetEntry = buildSetWeightEntry({
        setId: params.setId,
        setOrder: params.setOrder,
        weight: params.weight,
        reps: params.reps,
        previousEntry: currentEntry?.sets?.[params.setId],
    });

    const nextEntry: ExerciseWeightEntry = {
        workoutExerciseId: params.workoutExerciseId,
        exerciseId: params.exerciseId,
        exerciseName: params.exerciseName,
        sets: {
            ...(currentEntry?.sets ?? {}),
            [params.setId]: nextSetEntry,
        },
        updatedAt: new Date().toISOString(),
    };

    console.log(`${DEBUG_PREFIX} next saved entry:`, nextEntry);
    historyMap[params.workoutExerciseId] = nextEntry;
    await writeExerciseWeightHistoryMap(historyMap);

    return nextEntry;
}

export async function ensureExerciseWeightHistory(params: {
    workoutExerciseId: string;
    exerciseId: string;
    exerciseName: string;
    setId: string;
    setOrder: number;
    weight: number;
    reps: number;
}): Promise<ExerciseWeightEntry> {
    const historyMap = await readExerciseWeightHistoryMap();
    const currentEntry = historyMap[params.workoutExerciseId];
    const existingSetEntry = currentEntry?.sets?.[params.setId];

    if (hasCompleteSetHistoryEntry(existingSetEntry)) {
        console.log(
            `${DEBUG_PREFIX} keeping existing seeded history for set:`,
            params.setId,
            existingSetEntry
        );
        return currentEntry;
    }

    console.log(`${DEBUG_PREFIX} seeding initial history:`, params);

    const nextSetEntry = buildSetWeightEntry({
        setId: params.setId,
        setOrder: params.setOrder,
        weight: params.weight,
        reps: params.reps,
    });

    const nextEntry: ExerciseWeightEntry = {
        workoutExerciseId: params.workoutExerciseId,
        exerciseId: params.exerciseId,
        exerciseName: params.exerciseName,
        sets: {
            ...(currentEntry?.sets ?? {}),
            [params.setId]: nextSetEntry,
        },
        updatedAt: new Date().toISOString(),
    };

    console.log(`${DEBUG_PREFIX} seeded entry:`, nextEntry);
    historyMap[params.workoutExerciseId] = nextEntry;
    await writeExerciseWeightHistoryMap(historyMap);

    return nextEntry;
}

export async function removeExerciseWeightHistorySet(params: {
    workoutExerciseId: string;
    setId: string;
}): Promise<void> {
    const historyMap = await readExerciseWeightHistoryMap();
    const currentEntry = historyMap[params.workoutExerciseId];

    if (!currentEntry?.sets?.[params.setId]) {
        console.log(
            `${DEBUG_PREFIX} skipping local history removal because set was not found:`,
            params
        );
        return;
    }

    const nextSets = { ...currentEntry.sets };
    delete nextSets[params.setId];

    if (Object.keys(nextSets).length === 0) {
        delete historyMap[params.workoutExerciseId];
    } else {
        historyMap[params.workoutExerciseId] = {
            ...currentEntry,
            sets: nextSets,
            updatedAt: new Date().toISOString(),
        };
    }

    console.log(`${DEBUG_PREFIX} removed local set history:`, params);
    await writeExerciseWeightHistoryMap(historyMap);
}
