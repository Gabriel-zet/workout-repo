import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';
import { apiNotifications } from './api-notifications';
import { apiCache } from './api-cache';

const normalizeBaseUrl = (url?: string | null) => {
    const trimmedUrl = url?.trim();

    if (!trimmedUrl) {
        return undefined;
    }

    return trimmedUrl.replace(/\/+$/, '');
};

const getBaseUrl = () => {
    const configuredBaseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

    if (configuredBaseUrl) {
        return configuredBaseUrl;
    }

    if (!__DEV__) {
        return '';
    }

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
const API_BASE_URL_LABEL = API_BASE_URL || 'mesma origem do front';

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

interface ApiRequestOptions {
    notifyOnError?: boolean;
    mutedStatuses?: number[];
}

export interface ApiCacheOptions {
    force?: boolean;
}

const API_CACHE_TTL = {
    me: 60_000,
    workouts: 45_000,
    workout: 45_000,
    exercises: 120_000,
    workoutExercises: 45_000,
    sets: 30_000,
} as const;

class ApiClient {
    private baseURL: string;
    private refreshPromise: Promise<AuthTokens> | null = null;
    private lastNotificationKey: string | null = null;
    private lastNotificationAt = 0;

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
        apiCache.clear();
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        body?: any,
        requiresAuth: boolean = false,
        allowRefresh: boolean = true,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        if (!this.baseURL && Platform.OS !== 'web') {
            const configError = {
                status: 0,
                message:
                    'EXPO_PUBLIC_API_BASE_URL nao foi configurada neste build. Configure a URL publica da API no EAS e gere outro APK.',
            };

            this.notifyRequestError(method, endpoint, configError, options);
            throw configError;
        }

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
                    return this.request(method, endpoint, body, requiresAuth, false, options);
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
                    message: `Resposta inesperada da API. Confira se o backend esta rodando em ${API_BASE_URL_LABEL}.`,
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
            if (
                error.message?.includes('Network request failed') ||
                error.message?.includes('Failed to fetch')
            ) {
                const networkError = {
                    message: `Nao foi possivel conectar a API em ${API_BASE_URL_LABEL}. Verifique se o servidor esta rodando.`,
                    status: 0,
                };

                console.error(`[API] Network error - Backend not reachable at ${url}`);
                this.notifyRequestError(method, endpoint, networkError, options);
                throw networkError;
            }

            console.error(`[API] Erro em ${method} ${endpoint}:`, error);
            this.notifyRequestError(method, endpoint, error, options);
            throw error;
        }
    }

    private cachedRequest<T>(
        key: string,
        ttlMs: number,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        body?: any,
        requiresAuth: boolean = false,
        allowRefresh: boolean = true,
        requestOptions: ApiRequestOptions = {},
        cacheOptions: ApiCacheOptions = {}
    ): Promise<T> {
        return apiCache.get(
            key,
            () => this.request<T>(method, endpoint, body, requiresAuth, allowRefresh, requestOptions),
            {
                ttlMs,
                force: cacheOptions.force,
            }
        );
    }

    private invalidateWorkoutCache(workoutId?: string) {
        apiCache.invalidate('workouts:list');

        if (workoutId) {
            apiCache.invalidate(`workout:${workoutId}`);
            apiCache.invalidate(`workout-exercises:${workoutId}`);
            return;
        }

        apiCache.invalidatePrefix('workout:');
        apiCache.invalidatePrefix('workout-exercises:');
    }

    isWorkoutsCacheFresh() {
        return apiCache.isFresh('workouts:list', API_CACHE_TTL.workouts);
    }

    isWorkoutCacheFresh(id: string) {
        return apiCache.isFresh(`workout:${id}`, API_CACHE_TTL.workout);
    }

    isExercisesCacheFresh() {
        return apiCache.isFresh('exercises:list', API_CACHE_TTL.exercises);
    }

    isWorkoutExercisesCacheFresh(workoutId: string) {
        return apiCache.isFresh(
            `workout-exercises:${workoutId}`,
            API_CACHE_TTL.workoutExercises
        );
    }

    private notifyRequestError(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        error: any,
        options: ApiRequestOptions
    ) {
        if (options.notifyOnError === false) {
            return;
        }

        const status = typeof error?.status === 'number' ? error.status : undefined;
        if (status && options.mutedStatuses?.includes(status)) {
            return;
        }

        const message = error?.message || 'Erro inesperado na requisicao';
        const statusLabel = status === 0 ? 'sem conexao' : status ? `HTTP ${status}` : 'sem status';
        const notificationKey = `${method}:${endpoint}:${statusLabel}:${message}`;
        const now = Date.now();

        if (
            this.lastNotificationKey === notificationKey &&
            now - this.lastNotificationAt < 1800
        ) {
            return;
        }

        this.lastNotificationKey = notificationKey;
        this.lastNotificationAt = now;

        apiNotifications.notify({
            type: 'error',
            title: this.getErrorNotificationTitle(status),
            message,
            meta: `${method} ${endpoint} - ${statusLabel}`,
        });
    }

    private getErrorNotificationTitle(status?: number) {
        if (status === 0) {
            return 'API indisponivel';
        }

        if (status === 401) {
            return 'Sessao expirada';
        }

        if (status && status >= 500) {
            return 'Erro no servidor';
        }

        return 'Erro na API';
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
                    false,
                    { notifyOnError: false }
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
            const result = await this.cachedRequest<{
                id: number;
                email: string;
                name: string;
                createdAt?: string;
            }>(
                'me',
                API_CACHE_TTL.me,
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

        const workout = await this.request<{
            id: string;
            date: string;
            title: string;
            notes?: string;
            userId: number;
            createdAt: string;
            updatedAt: string;
        }>('POST', '/workouts/create', body, true);

        this.invalidateWorkoutCache(workout.id);
        return workout;
    }

    async getWorkouts(options: ApiCacheOptions = {}): Promise<
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
        return this.cachedRequest(
            'workouts:list',
            API_CACHE_TTL.workouts,
            'GET',
            '/workouts/list',
            undefined,
            true,
            true,
            {},
            options
        );
    }

    async getWorkoutById(id: string, options: ApiCacheOptions = {}): Promise<{
        id: string;
        date: string;
        title: string;
        notes?: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
        workoutExercises?: any[];
    }> {
        return this.cachedRequest(
            `workout:${id}`,
            API_CACHE_TTL.workout,
            'GET',
            `/workouts/profile/${id}`,
            undefined,
            true,
            true,
            {},
            options
        );
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

        const updated = await this.request('PUT', `/workouts/profile/${id}`, body, true);
        this.invalidateWorkoutCache(id);
        return updated;
    }

    async deleteWorkout(id: string): Promise<void> {
        await this.request('DELETE', `/workouts/delete/${id}`, undefined, true);
        this.invalidateWorkoutCache(id);
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

    async getExercises(options: ApiCacheOptions = {}): Promise<
        Array<{
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
            userId: number;
        }>
    > {
        return this.cachedRequest(
            'exercises:list',
            API_CACHE_TTL.exercises,
            'GET',
            '/exercises',
            undefined,
            true,
            true,
            {},
            options
        );
    }

    async createExercise(name: string): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        userId: number;
    }> {
        const exercise = await this.request<{
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
            userId: number;
        }>('POST', '/exercises', { name }, true);

        apiCache.invalidate('exercises:list');
        return exercise;
    }

    async deleteExercise(id: string): Promise<void> {
        await this.request('DELETE', `/exercises/${id}`, undefined, true);
        apiCache.invalidate('exercises:list');
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
        const workoutExercise = await this.request<{
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
        }>('POST', '/workout-exercises', input, true);

        this.invalidateWorkoutCache(input.workoutId);
        return workoutExercise;
    }

    async getWorkoutExercisesByWorkout(workoutId: string, options: ApiCacheOptions = {}): Promise<
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
        return this.cachedRequest(
            `workout-exercises:${workoutId}`,
            API_CACHE_TTL.workoutExercises,
            'GET',
            `/workout-exercises/workout/${workoutId}`,
            undefined,
            true,
            true,
            { mutedStatuses: [404] },
            options
        );
    }

    async deleteWorkoutExercise(id: string): Promise<void> {
        await this.request('DELETE', `/workout-exercises/${id}`, undefined, true);
        this.invalidateWorkoutCache();
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
        const createdSet = await this.request<{
            id: string;
            order: number;
            reps: number | null;
            weight: string | null;
            createdAt?: string;
            updatedAt?: string;
            workoutExerciseId: string;
        }>(
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

        this.invalidateWorkoutCache();
        apiCache.invalidate(`sets:${workoutExerciseId}`);
        return createdSet;
    }

    async listSets(workoutExerciseId: string, options: ApiCacheOptions = {}): Promise<
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
        return this.cachedRequest(
            `sets:${workoutExerciseId}`,
            API_CACHE_TTL.sets,
            'GET',
            `/workout-exercises/${workoutExerciseId}/sets`,
            undefined,
            true,
            true,
            {},
            options
        );
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

        const updatedSet = await this.request<{
            id: string;
            order: number;
            reps: number | null;
            weight: string | null;
            createdAt?: string;
            updatedAt?: string;
            workoutExerciseId: string;
        }>(
            'PUT',
            `/workout-exercises/${workoutExerciseId}/sets/${setId}`,
            body,
            true
        );

        this.invalidateWorkoutCache();
        apiCache.invalidate(`sets:${workoutExerciseId}`);
        return updatedSet;
    }

    async deleteSet(workoutExerciseId: string, setId: string): Promise<void> {
        await this.request(
            'DELETE',
            `/workout-exercises/${workoutExerciseId}/sets/${setId}`,
            undefined,
            true
        );

        this.invalidateWorkoutCache();
        apiCache.invalidate(`sets:${workoutExerciseId}`);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
