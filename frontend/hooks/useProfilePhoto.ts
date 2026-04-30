import { useEffect, useState } from 'react';

import {
    getProfilePhotoUri,
    subscribeToProfilePhoto,
} from '@/services/profile-photo-storage';

export function useProfilePhoto() {
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadProfilePhoto = async () => {
            try {
                const storedPhotoUri = await getProfilePhotoUri();
                if (isMounted) {
                    setPhotoUri(storedPhotoUri);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProfilePhoto();

        const unsubscribe = subscribeToProfilePhoto(nextPhotoUri => {
            if (isMounted) {
                setPhotoUri(nextPhotoUri);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return {
        photoUri,
        isLoading,
    };
}
