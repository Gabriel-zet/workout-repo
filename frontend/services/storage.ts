import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback storage for web and when AsyncStorage fails
const fallbackStorage: Record<string, string> = {};

type WebStorage = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
};

class StorageService {
    private isNativeAvailable = true;

    private getWebStorage(): WebStorage | null {
        if (Platform.OS !== 'web') {
            return null;
        }

        try {
            return (globalThis as { localStorage?: WebStorage }).localStorage ?? null;
        } catch (error) {
            console.warn('Storage.localStorage unavailable, using fallback', error);
            return null;
        }
    }

    async getItem(key: string): Promise<string | null> {
        try {
            const webStorage = this.getWebStorage();
            if (webStorage) {
                return webStorage.getItem(key);
            }

            if (Platform.OS === 'web' || !this.isNativeAvailable) {
                return fallbackStorage[key] || null;
            }
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.warn(`Storage.getItem failed for ${key}, using fallback`, error);
            this.isNativeAvailable = false;
            return fallbackStorage[key] || null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            const webStorage = this.getWebStorage();
            if (webStorage) {
                webStorage.setItem(key, value);
                return;
            }

            if (Platform.OS === 'web' || !this.isNativeAvailable) {
                fallbackStorage[key] = value;
                return;
            }
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Storage.setItem failed for ${key}, using fallback`, error);
            this.isNativeAvailable = false;
            fallbackStorage[key] = value;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            const webStorage = this.getWebStorage();
            if (webStorage) {
                webStorage.removeItem(key);
                return;
            }

            if (Platform.OS === 'web' || !this.isNativeAvailable) {
                delete fallbackStorage[key];
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.warn(`Storage.removeItem failed for ${key}, using fallback`, error);
            this.isNativeAvailable = false;
            delete fallbackStorage[key];
        }
    }

    async clear(): Promise<void> {
        try {
            const webStorage = this.getWebStorage();
            if (webStorage) {
                webStorage.clear();
                return;
            }

            if (Platform.OS === 'web' || !this.isNativeAvailable) {
                Object.keys(fallbackStorage).forEach(key => delete fallbackStorage[key]);
                return;
            }
            await AsyncStorage.clear();
        } catch (error) {
            console.warn('Storage.clear failed, using fallback', error);
            this.isNativeAvailable = false;
            Object.keys(fallbackStorage).forEach(key => delete fallbackStorage[key]);
        }
    }
}

export const storage = new StorageService();
