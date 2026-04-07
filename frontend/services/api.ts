import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';

// Resolve base URL automaticamente
const getBaseUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;

    // Expo Go (celular ou até emulador via LAN)
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:3000`;
    }

    // fallback (caso não tenha hostUri)
    return Platform.select({
        android: 'http://10.0.2.2:3000',
        ios: 'http://localhost:3000',
        web: 'http://localhost:3000',
        default: 'http://localhost:3000',
    });
};

const API_BASE_URL = getBaseUrl();

// URL base - ajuste conforme ambiente
// const API_BASE_URL = Platform.select({
//     web: 'http://localhost:3000/api',
//     android: 'http://10.0.2.2:3000/api', // Android emulator localhost
//     ios: 'http://localhost:3000/api',
//     default: 'http://localhost:3000/api',
// });

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    issues?: any[];
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    async getToken(): Promise<string | null> {
        return await storage.getItem('auth_token');
    }

    async setToken(token: string): Promise<void> {
        await storage.setItem('auth_token', token);
    }

    async removeToken(): Promise<void> {
        await storage.removeItem('auth_token');
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        body?: any,
        requiresAuth: boolean = false
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = await this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const config: RequestInit = {
                method,
                headers,
            };

            if (body && method !== 'GET') {
                config.body = JSON.stringify(body);
            }

            const response = await fetch(url, config);

            if (response.status === 204) {
                return {} as T; // No content
            }

            let data;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error(`[API] Non-JSON response from ${method} ${endpoint}:`, text.substring(0, 200));
                throw {
                    status: response.status,
                    message: `API returned ${response.status} with non-JSON response. Check if backend is running at ${this.baseURL}`,
                };
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Erro na requisição',
                    issues: data.issues,
                };
            }

            return data;
        } catch (error: any) {
            if (error.message?.includes('Network request failed')) {
                console.error(`[API] Network error - Backend not reachable at ${url}`);
                throw {
                    message: `Cannot connect to backend at ${this.baseURL}. Make sure the server is running.`,
                    status: 0,
                };
            }
            console.error(`[API] Erro em ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email: string, password: string): Promise<{ token: string }> {
        return this.request('POST', '/auth/login', { email, password });
    }

    async register(
        name: string,
        email: string,
        password: string
    ): Promise<{ id: number; email: string; name: string }> {
        return this.request('POST', '/user/register', { name, email, password });
    }

    async getMe(): Promise<{ id: number; email: string; name: string; createdAt?: string }> {
        console.log('API: Calling getMe');
        try {
            const result = await this.request<{
                id: number;
                email: string;
                name: string;
                createdAt?: string;
            }>(
                'GET',
                '/me',
                undefined,
                true
            );
            console.log('API: getMe success', result);
            return result;
        } catch (error) {
            console.error('API: getMe failed', error);
            throw error;
        }
    }

    // Workouts endpoints
    async createWorkout(
        date: Date,
        title: string,
        notes?: string
    ): Promise<{
        id: string;
        date: string;
        title: string;
        notes?: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
    }> {
        const body: {
            date: string;
            title: string;
            notes?: string;
        } = {
            date: date.toISOString(),
            title,
        };

        const normalizedNotes = notes?.trim();
        if (normalizedNotes) {
            body.notes = normalizedNotes;
        }

        return this.request('POST', '/workouts/create', body, true);
    }

    async getWorkouts(): Promise<
        Array<{
            id: string;
            date: string;
            title: string;
            notes?: string;
            userId: number;
            createdAt: string;
            updatedAt: string;
            workoutExercises?: any[];
        }>
    > {
        return this.request('GET', '/workouts/list', undefined, true);
    }

    async getWorkoutById(id: string): Promise<{
        id: string;
        date: string;
        title: string;
        notes?: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
        workoutExercises?: any[];
    }> {
        return this.request('GET', `/workouts/profile/${id}`, undefined, true);
    }

    async updateWorkout(
        id: string,
        updates: {
            date?: Date;
            title?: string;
            notes?: string | null;
        }
    ): Promise<any> {
        const body: any = {};
        if (updates.date) body.date = updates.date.toISOString();
        if (updates.title) body.title = updates.title;
        if (updates.notes !== undefined) body.notes = updates.notes;

        return this.request('PUT', `/workouts/profile/${id}`, body, true);
    }

    async deleteWorkout(id: string): Promise<void> {
        return this.request('DELETE', `/workouts/delete/${id}`, undefined, true);
    }

    // User endpoints
    async getUserProfile(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: string;
    }> {
        return this.request('GET', `/user/profile/${id}`, undefined, true);
    }

    async deleteUser(id: number): Promise<void> {
        return this.request('DELETE', `/user/delete/${id}`, undefined, true);
    }

    async getExercises(): Promise<
        Array<{
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
            userId: number;
        }>
    > {
        return this.request('GET', '/exercises', undefined, true);
    }

    async createExercise(name: string): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        userId: number;
    }> {
        return this.request('POST', '/exercises', { name }, true);
    }

    async deleteExercise(id: string): Promise<void> {
        return this.request('DELETE', `/exercises/${id}`, undefined, true);
    }

    async createWorkoutExercise(input: {
        workoutId: string;
        exerciseId: string;
        order: number;
        notes?: string;
    }): Promise<{
        id: string;
        order: number;
        notes?: string | null;
        workoutId: string;
        exerciseId: string;
        createdAt?: string;
        updatedAt?: string;
        exercise: {
            id: string;
            name: string;
            createdAt?: string;
            updatedAt?: string;
            userId?: number;
        };
        sets: Array<{
            id: string;
            order: number;
            reps: number | null;
            weight: string | number | null;
            createdAt?: string;
            updatedAt?: string;
        }>;
    }> {
        return this.request('POST', '/workout-exercises', input, true);
    }

    async getWorkoutExercisesByWorkout(workoutId: string): Promise<
        Array<{
            id: string;
            order: number;
            notes?: string | null;
            workoutId: string;
            exerciseId: string;
            createdAt?: string;
            updatedAt?: string;
            exercise: {
                id: string;
                name: string;
                createdAt?: string;
                updatedAt?: string;
                userId?: number;
            };
            sets: Array<{
                id: string;
                order: number;
                reps: number | null;
                weight: string | number | null;
                createdAt?: string;
                updatedAt?: string;
            }>;
        }>
    > {
        return this.request('GET', `/workout-exercises/workout/${workoutId}`, undefined, true);
    }

    async deleteWorkoutExercise(id: string): Promise<void> {
        return this.request('DELETE', `/workout-exercises/${id}`, undefined, true);
    }

    async createSet(
        workoutExerciseId: string,
        input: {
            order: number;
            reps?: number | null;
            weight?: number | null;
        }
    ): Promise<{
        id: string;
        order: number;
        reps: number | null;
        weight: string | null;
        createdAt?: string;
        updatedAt?: string;
        workoutExerciseId: string;
    }> {
        return this.request(
            'POST',
            `/workout-exercises/${workoutExerciseId}/sets`,
            {
                order: input.order,
                reps: input.reps ?? null,
                weight:
                    input.weight === undefined || input.weight === null
                        ? null
                        : input.weight.toFixed(2),
            },
            true
        );
    }

    async listSets(workoutExerciseId: string): Promise<
        Array<{
            id: string;
            order: number;
            reps: number | null;
            weight: string | null;
            createdAt?: string;
            updatedAt?: string;
            workoutExerciseId: string;
        }>
    > {
        return this.request('GET', `/workout-exercises/${workoutExerciseId}/sets`, undefined, true);
    }

    async updateSet(
        workoutExerciseId: string,
        setId: string,
        input: {
            order?: number;
            reps?: number | null;
            weight?: number | null;
        }
    ): Promise<{
        id: string;
        order: number;
        reps: number | null;
        weight: string | null;
        createdAt?: string;
        updatedAt?: string;
        workoutExerciseId: string;
    }> {
        const body: {
            order?: number;
            reps?: number | null;
            weight?: string | null;
        } = {};

        if (input.order !== undefined) body.order = input.order;
        if (input.reps !== undefined) body.reps = input.reps;
        if (input.weight !== undefined) {
            body.weight = input.weight === null ? null : input.weight.toFixed(2);
        }

        return this.request(
            'PUT',
            `/workout-exercises/${workoutExerciseId}/sets/${setId}`,
            body,
            true
        );
    }

    async deleteSet(workoutExerciseId: string, setId: string): Promise<void> {
        return this.request(
            'DELETE',
            `/workout-exercises/${workoutExerciseId}/sets/${setId}`,
            undefined,
            true
        );
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
