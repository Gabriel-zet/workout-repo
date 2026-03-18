
export type CreateWorkoutInput = {
    date: Date;
    title: string;
    userId: number;
    notes?: string | null | undefined;
};

/*
{
    "date": Date,
    "title": "str"
    "notes": "teste"
}


    date: Date;
    title: string;
    userId: number;
    notes?: string | null | undefined;

    */