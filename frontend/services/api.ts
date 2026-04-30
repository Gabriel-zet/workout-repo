import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';

const getBaseUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;

    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:3000`;
    }

    return Platform.select({
        android: 'http://10.0.2.2:3000',
        ios: 'http://localhost:3000',
        web: 'http://localhost:3000',
        default: 'http://localhost:3000',
    });
};

const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    issues?: any[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponse {
    message: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
    accessToken: string;
    refreshToken: string;
}

class ApiClient {
    private baseURL: string;
    private refreshPromise: Promise<AuthTokens> | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    async getToken(): Promise<string | null> {
        return await storage.getItem('auth_token');
    }

    async setToken(token: string): Promise<void> {
        await storage.setItem('auth_token', token);
    }

    async getRefreshToken(): Promise<string | null> {
        return await storage.getItem('refresh_token');
    }

    async setRefreshToken(token: string): Promise<void> {
        await storage.setItem('refresh_token', token);
    }

    async setTokens(tokens: AuthTokens): Promise<void> {
        await Promise.all([
            this.setToken(tokens.accessToken),
            this.setRefreshToken(tokens.refreshToken),
        ]);
    }

    async removeToken(): Promise<void> {
        await storage.removeItem('auth_token');
    }

    async removeRefreshToken(): Promise<void> {
        await storage.removeItem('refresh_token');
    }

    async clearTokens(): Promise<void> {
        await Promise.all([this.removeToken(), this.removeRefreshToken()]);
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        body?: any,
        requiresAuth: boolean = false,
        allowRefresh: boolean = true
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

            if (response.status === 401 && requiresAuth && allowRefresh) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    return this.request(method, endpoint, body, requiresAuth, false);
                }
            }

            if (response.status === 204) {
                return {} as T;
            }

            let data;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error(
                    `[API] Non-JSON response from ${method} ${endpoint}:`,
                    text.substring(0, 200)
                );
                throw {
                    status: response.status,
                    message: `API returned ${response.status} with non-JSON response. Check if backend is running at ${this.baseURL}`,
                };
            }

            if (!response.ok) {
                const details = data.details ?? data.issues;
                const detailMessage = Array.isArray(details)
                    ? details.find((detail: { message?: string }) => detail?.message)?.message
                    : undefined;

                throw {
                    status: response.status,
                    message: data.message || data.error || detailMessage || 'Erro na requisicao',
                    issues: details,
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

    private async tryRefreshToken(): Promise<boolean> {
        try {
            await this.refreshSession();
            return true;
        } catch (error) {
            console.error('API: token refresh failed', error);
            await this.clearTokens();
            return false;
        }
    }

    async refreshSession(): Promise<AuthTokens> {
        if (!this.refreshPromise) {
            this.refreshPromise = (async () => {
                const refreshToken = await this.getRefreshToken();

                if (!refreshToken) {
                    throw {
                        status: 401,
                        message: 'Sessao expirada',
                    };
                }

                const tokens = await this.request<AuthTokens>(
                    'POST',
                    '/auth/refresh',
                    { refreshToken },
                    false,
                    false
                );

                await this.setTokens(tokens);
                return tokens;
            })().finally(() => {
                this.refreshPromise = null;
            });
        }

        return this.refreshPromise;
    }

    async login(email: string, password: string): Promise<AuthTokens> {
        const response = await this.request<{
            tokens?: AuthTokens;
            accessToken?: string;
            refreshToken?: string;
        }>('POST', '/auth/login', { email, password });

        if (response.tokens?.accessToken && response.tokens?.refreshToken) {
            return response.tokens;
        }

        if (response.accessToken && response.refreshToken) {
            return {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
            };
        }

        throw {
            status: 500,
            message: 'Resposta de login invalida da API',
        };
    }

    async register(
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<RegisterResponse> {
        return this.request('POST', '/auth/register', {
            name,
            email,
            password,
            confirmPassword,
        });
    }

    async logout(): Promise<void> {
        await this.request('POST', '/auth/logout', undefined, true);
    }

    async getMe(): Promise<{ id: number; email: string; name: string; createdAt?: string }> {
        console.log('API: Calling getMe');
        try {
            const result = await this.request<{
                id: number;
                email: string;
                name: string;
                createdAt?: string;
            }>('GET', '/me', undefined, true);
            console.log('API: getMe success', result);
            return result;
        } catch (error) {
            console.error('API: getMe failed', error);
            throw error;
        }
    }

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
