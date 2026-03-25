import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';

const PUBLIC_ROUTES = new Set(['login', 'register']);

function RootLayoutNav() {
    const { isSignedIn, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        const currentRoute = segments[0];
        const isPublicRoute = currentRoute ? PUBLIC_ROUTES.has(currentRoute) : false;

        if (isSignedIn && (!currentRoute || isPublicRoute)) {
            router.replace('/(tabs)');
        } else if (!isSignedIn && (!currentRoute || !isPublicRoute)) {
            router.replace('/login');
        }
    }, [isLoading, isSignedIn, router, segments]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#09090b]">
                <ActivityIndicator size="small" color="#FF6800" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#09090b' },
            }}
        >
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', title: 'Ajustes' }}
            />

            <Stack.Screen
                name="create-workout"
                options={{
                    title: 'Novo Treino',
                    presentation: Platform.OS === 'ios' ? 'formSheet' : 'card'
                }}
            />

            <Stack.Screen
                name="workout-detail"
                options={{ title: 'Performance' }}
            />

            <Stack.Screen
                name="workouts-list"
                options={{ title: 'Biblioteca' }}
            />

            <Stack.Screen
                name="exercises"
                options={{ title: 'Exercicios' }}
            />
        </Stack>
    );
}

export default RootLayoutNav;
