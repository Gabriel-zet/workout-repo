import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import theme from '@/constants/theme';

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

    return (
        <View className="flex-1 bg-canvas">
            {isLoading ? (
                <View className="flex-1 justify-center items-center bg-canvas">
                    <ActivityIndicator size="small" color={theme.colors.brand} />
                </View>
            ) : (
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: theme.colors.canvas },
                        gestureEnabled: true,
                        fullScreenGestureEnabled: true,
                        gestureDirection: 'horizontal',
                        animation: 'slide_from_right',
                        animationMatchesGesture: true,
                    }}
                >
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="register" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    <Stack.Screen
                        name="modal"
                        options={{
                            presentation: 'modal',
                            title: 'Ajustes',
                            gestureEnabled: true,
                        }}
                    />

                    <Stack.Screen
                        name="create-workout"
                        options={{
                            title: 'Novo Treino',
                            presentation: Platform.OS === 'ios' ? 'formSheet' : 'card',
                            gestureEnabled: true,
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
            )}
        </View>
    );
}

export default RootLayoutNav;

