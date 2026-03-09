
export type CreateWorkoutInput = {
    date: Date;
    title: string;
    userId: number;
    notes?: string | null | undefined;
};
