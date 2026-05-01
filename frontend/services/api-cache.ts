interface ApiCacheEntry<T> {
    value?: T;
    hasValue: boolean;
    updatedAt: number;
    promise?: Promise<T>;
}

interface ApiCacheOptions {
    ttlMs: number;
    force?: boolean;
}

const cache = new Map<string, ApiCacheEntry<unknown>>();

function getEntry<T>(key: string) {
    return cache.get(key) as ApiCacheEntry<T> | undefined;
}

function isFresh(key: string, ttlMs: number) {
    const entry = getEntry(key);
    return Boolean(entry?.hasValue && Date.now() - entry.updatedAt < ttlMs);
}

async function get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: ApiCacheOptions
): Promise<T> {
    const entry = getEntry<T>(key);

    if (!options.force && entry?.hasValue && Date.now() - entry.updatedAt < options.ttlMs) {
        return entry.value as T;
    }

    if (entry?.promise) {
        return entry.promise;
    }

    const promise = fetcher()
        .then((value) => {
            cache.set(key, {
                value,
                hasValue: true,
                updatedAt: Date.now(),
            });
            return value;
        })
        .catch((error) => {
            if (entry?.hasValue) {
                cache.set(key, {
                    ...entry,
                    promise: undefined,
                });
            } else {
                cache.delete(key);
            }

            throw error;
        });

    cache.set(key, {
        value: entry?.value,
        hasValue: entry?.hasValue ?? false,
        updatedAt: entry?.updatedAt ?? 0,
        promise,
    });

    return promise;
}

function set<T>(key: string, value: T) {
    cache.set(key, {
        value,
        hasValue: true,
        updatedAt: Date.now(),
    });
}

function invalidate(key: string) {
    cache.delete(key);
}

function invalidatePrefix(prefix: string) {
    Array.from(cache.keys()).forEach((key) => {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    });
}

function clear() {
    cache.clear();
}

export const apiCache = {
    get,
    set,
    isFresh,
    invalidate,
    invalidatePrefix,
    clear,
};
