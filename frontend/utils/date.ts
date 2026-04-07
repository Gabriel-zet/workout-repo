export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getStoredDateKey(value: string): string {
    return value.split('T')[0];
}

export function parseDateInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return new Date(Number.NaN);
    }

    return new Date(year, month - 1, day);
}

export function parseStoredDate(value: string): Date {
    return parseDateInput(getStoredDateKey(value));
}

export function getWeekdayIndex(value: string | Date): number {
    const date = typeof value === 'string' ? parseStoredDate(value) : value;
    return date.getDay();
}

export function isSameWeekday(a: string | Date, b: string | Date): boolean {
    return getWeekdayIndex(a) === getWeekdayIndex(b);
}

export function formatWeekdayName(
    value: string | Date,
    format: 'long' | 'short' = 'long'
): string {
    const date = typeof value === 'string' ? parseStoredDate(value) : value;
    const weekday = date.toLocaleDateString('pt-BR', { weekday: format });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function formatWeeklySchedule(value: string | Date): string {
    const date = typeof value === 'string' ? parseStoredDate(value) : value;
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return weekday;
}

export function formatDateInputValue(value: string | Date): string {
    if (typeof value === 'string') {
        return getStoredDateKey(value);
    }

    return formatDateKey(value);
}

export function isSameCalendarDay(a: string | Date, b: string | Date): boolean {
    const first = typeof a === 'string' ? getStoredDateKey(a) : formatDateKey(a);
    const second = typeof b === 'string' ? getStoredDateKey(b) : formatDateKey(b);

    return first === second;
}

export function startOfLocalDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}

export function alignDateToCurrentWeek(
    value: string | Date,
    reference: Date = new Date()
): Date {
    const normalizedReference = startOfLocalDay(reference);
    const currentWeekday = normalizedReference.getDay();
    const diffToMonday = currentWeekday === 0 ? -6 : 1 - currentWeekday;

    const startOfWeek = new Date(normalizedReference);
    startOfWeek.setDate(normalizedReference.getDate() + diffToMonday);

    const targetWeekday = getWeekdayIndex(value);
    const mondayBasedTarget = targetWeekday === 0 ? 6 : targetWeekday - 1;

    const alignedDate = new Date(startOfWeek);
    alignedDate.setDate(startOfWeek.getDate() + mondayBasedTarget);
    return alignedDate;
}
