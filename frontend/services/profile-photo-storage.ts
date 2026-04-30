import type { ImagePickerAsset } from 'expo-image-picker';

import { storage } from '@/services/storage';

const PROFILE_PHOTO_STORAGE_KEY = 'profile_photo_uri';

const listeners = new Set<(photoUri: string | null) => void>();

function emitProfilePhotoChange(photoUri: string | null) {
    listeners.forEach(listener => listener(photoUri));
}

function getStoredPhotoUri(asset: ImagePickerAsset) {
    if (asset.base64) {
        return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
    }

    return asset.uri;
}

export async function getProfilePhotoUri() {
    return await storage.getItem(PROFILE_PHOTO_STORAGE_KEY);
}

export function subscribeToProfilePhoto(
    listener: (photoUri: string | null) => void
) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export async function saveProfilePhoto(asset: ImagePickerAsset) {
    const nextPhotoUri = getStoredPhotoUri(asset);

    await storage.setItem(PROFILE_PHOTO_STORAGE_KEY, nextPhotoUri);
    emitProfilePhotoChange(nextPhotoUri);

    return nextPhotoUri;
}

export async function removeProfilePhoto() {
    await storage.removeItem(PROFILE_PHOTO_STORAGE_KEY);
    emitProfilePhotoChange(null);
}
