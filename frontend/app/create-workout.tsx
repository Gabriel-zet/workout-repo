import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    LayoutAnimation,
    UIManager,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useExerciseManager, Exercise } from '@/hooks/useExerciseManager';
import { useWorkoutById, WorkoutExercise } from '@/hooks/useWorkouts';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseSelector } from '@/components/ui/modals/ExerciseSelector';
import HomeCalendar from '@/components/ui/calendar/HomeCalendar';
import { SetManager } from '@/components/ui/forms/SetManager';
import { apiClient } from '@/services/api';
import { alignDateToCurrentWeek } from '@/utils/date';
import {
    normalizeWorkoutExerciseFromApi,
    normalizeWorkoutSetFromApi,
} from '@/utils/workout-exercise';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CreateWorkoutScreen() {
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const params = useLocalSearchParams();
    const workoutId = typeof params.id === 'string' ? params.id : '';
    const isEditing = workoutId.length > 0;
    const { workout, loading: workoutLoading } = useWorkoutById(workoutId);
    const {
        exercises: catalogExercises,
        loading: catalogLoading,
        refetch: refetchExercises,
    } = useExercises();

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);

    const {
        exercises,
        replaceExercises,
        addExercise,
        removeExercise,
        addSet,
        updateSet,
        removeSet,
        clearAllExercises,
    } = useExerciseManager();

    useEffect(() => {
        if (!isEditing) {
            clearAllExercises();
            setTitle('');
            setNotes('');
            setSelectedDate(new Date());
            return;
        }

        if (!workout) return;

        setTitle(workout.title);
        setNotes(workout.notes ?? '');
        setSelectedDate(alignDateToCurrentWeek(workout.date));
        replaceExercises(workout.workoutExercises ?? []);
    }, [clearAllExercises, isEditing, replaceExercises, workout]);

    const animateLayout = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: { type: 'easeInEaseOut', property: 'opacity' },
            update: { type: 'spring', springDamping: 0.8 },
            delete: { type: 'easeOut', property: 'opacity' },
        });
    };

    const handleAddExercise = useCallback(
        (exercise: Exercise) => {
            animateLayout();
            addExercise(exercise);
            setShowExerciseSelector(false);
        },
        [addExercise]
    );

    const handleOpenExerciseCatalog = useCallback(() => {
        setShowExerciseSelector(false);
        router.push('/exercises');
    }, [router]);

    const handleOpenSelector = useCallback(async () => {
        if (!catalogLoading && catalogExercises.length === 0) {
            await refetchExercises();
        }

        setShowExerciseSelector(true);
    }, [catalogExercises.length, catalogLoading, refetchExercises]);

    const handleRemoveExercise = (id: string) => {
        Alert.alert(
            'Remover exercicio',
            'Tem certeza que deseja remover este exercicio do treino?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => {
                        animateLayout();
                        removeExercise(id);
                    },
                },
            ]
        );
    };

    const syncWorkoutExercises = useCallback(
        async (targetWorkoutId: string): Promise<WorkoutExercise[]> => {
            const currentWorkoutExercises = await apiClient
                .getWorkoutExercisesByWorkout(targetWorkoutId)
                .catch((error: any) => {
                    if (error?.status === 404) {
                        return [];
                    }

                    throw error;
                });

            await Promise.all(
                currentWorkoutExercises.map((workoutExercise) =>
                    apiClient.deleteWorkoutExercise(workoutExercise.id)
                )
            );

            const persistedExercises: WorkoutExercise[] = [];

            for (const [index, workoutExercise] of exercises.entries()) {
                const createdWorkoutExercise = await apiClient.createWorkoutExercise({
                    workoutId: targetWorkoutId,
                    exerciseId: workoutExercise.exerciseId,
                    order: index + 1,
                    notes: workoutExercise.notes ?? undefined,
                });

                const createdSets = [];

                for (const [setIndex, set] of workoutExercise.sets.entries()) {
                    const createdSet = await apiClient.createSet(createdWorkoutExercise.id, {
                        order: set.order ?? setIndex + 1,
                        reps: set.reps,
                        weight: set.weight,
                    });

                    createdSets.push(normalizeWorkoutSetFromApi(createdSet, setIndex + 1));
                }

                persistedExercises.push(
                    normalizeWorkoutExerciseFromApi({
                        ...createdWorkoutExercise,
                        exercise: {
                            ...workoutExercise.exercise,
                            ...createdWorkoutExercise.exercise,
                        },
                        sets: createdSets,
                    })
                );
            }

            return persistedExercises;
        },
        [exercises]
    );

    const handleSaveWorkout = useCallback(async () => {
        Keyboard.dismiss();

        if (!title.trim()) {
            Alert.alert('Faltou o titulo!', 'De um nome inspirador para o seu treino.');
            return;
        }

        if (!isEditing && exercises.length === 0) {
            Alert.alert('Treino vazio', 'Adicione pelo menos um exercicio para comecar a suar.');
            return;
        }

        try {
            setLoading(true);

            if (isEditing) {
                await apiClient.updateWorkout(workoutId, {
                    title,
                    notes,
                    date: selectedDate,
                });
                await syncWorkoutExercises(workoutId);
            } else {
                const createdWorkout = await apiClient.createWorkout(
                    selectedDate,
                    title,
                    notes
                );
                await syncWorkoutExercises(createdWorkout.id);
            }

            router.back();
        } catch (error) {
            console.error('Erro ao salvar treino:', error);
            Alert.alert(
                'Ops!',
                'Nao foi possivel salvar o treino. Verifique sua conexao e tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    }, [
        exercises.length,
        isEditing,
        notes,
        router,
        selectedDate,
        syncWorkoutExercises,
        title,
        workoutId,
    ]);

    if (isEditing && workoutLoading && !workout) {
        return (
            <SafeAreaView className="flex-1 bg-[#09090b] justify-center items-center">
                <ActivityIndicator size="large" color="#FF6800" />
            </SafeAreaView>
        );
    }

    const hasExercises = exercises.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: headerHeight + 24,
                        paddingBottom: 140,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mb-6">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <TextInput
                                    className="text-white text-4xl font-firs-bold p-0 includeFontPadding-false"
                                    placeholder="Nome do Treino"
                                    placeholderTextColor="#52525b"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={40}
                                    style={{ verticalAlign: 'middle' }}
                                />

                                <TextInput
                                    className="text-zinc-500 font-firs-regular text-lg mt-1 p-0 includeFontPadding-false"
                                    placeholder="Adicionar nota para o treino"
                                    placeholderTextColor="#52525b"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />
                            </View>
                        </View>
                    </View>

                    <View className="my-2">
                        <HomeCalendar
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                        />
                    </View>

                    <View className="flex-1">
                        {!hasExercises ? (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    handleOpenSelector().catch(() => undefined);
                                }}
                                className="bg-[#121212] rounded-[32px] p-10 items-center justify-center mb-4"
                            >
                                <View className="items-center justify-center">
                                    <MaterialCommunityIcons
                                        name="plus"
                                        size={32}
                                        color="#FFFFFF"
                                    />
                                </View>

                                <View className="mt-5 items-center">
                                    <Text className="text-white font-firs-bold text-lg tracking-tight">
                                        Adicionar Exercicio
                                    </Text>
                                    <Text className="text-zinc-500 font-firs-regular text-sm mt-1">
                                        {catalogExercises.length === 0
                                            ? 'Crie exercicios no catalogo para montar seu treino'
                                            : 'Monte sua rotina de treino agora'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            exercises.map((workoutExercise) => (
                                <View
                                    key={workoutExercise.id}
                                    className="bg-[#121212] rounded-[32px] mb-4 overflow-hidden p-6"
                                >
                                    <View className="flex-row justify-between items-start mb-6">
                                        <View className="flex-1 pr-4">
                                            <Text className="text-zinc-400 font-firs-regular text-base mb-1">
                                                {workoutExercise.exercise.targetMuscle || 'Exercicio'}
                                            </Text>

                                            <Text className="text-white font-firs-medium text-xl leading-tight mb-2">
                                                {workoutExercise.exercise.name}
                                            </Text>

                                            <Text className="text-zinc-600 font-firs-regular text-sm">
                                                {workoutExercise.sets.length} serie
                                                {workoutExercise.sets.length === 1 ? '' : 's'}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleRemoveExercise(workoutExercise.id)}
                                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                                        >
                                            <MaterialCommunityIcons
                                                name="dots-horizontal"
                                                size={24}
                                                color="#a1a1aa"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <SetManager
                                        sets={workoutExercise.sets}
                                        onAddSet={(reps, weight) =>
                                            addSet(workoutExercise.id, reps, weight)
                                        }
                                        onUpdateSet={(setId, updates) =>
                                            updateSet(workoutExercise.id, setId, updates)
                                        }
                                        onRemoveSet={(setId) =>
                                            removeSet(workoutExercise.id, setId)
                                        }
                                    />
                                </View>
                            ))
                        )}

                        {hasExercises && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className="bg-[#121212] rounded-[24px] py-4 flex-row items-center justify-center mt-2"
                                onPress={() => {
                                    handleOpenSelector().catch(() => undefined);
                                }}
                            >
                                <MaterialCommunityIcons name="plus" size={20} color="#a1a1aa" />
                                <Text className="text-zinc-300 font-firs-medium text-base ml-2">
                                    Adicionar Outro Exercicio
                                </Text>
                            </TouchableOpacity>
                        )}

                        {!hasExercises && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleOpenExerciseCatalog}
                                className="bg-zinc-900 rounded-[24px] py-4 px-5 flex-row items-center justify-center"
                            >
                                <MaterialCommunityIcons
                                    name="playlist-plus"
                                    size={20}
                                    color="#FF6B00"
                                />
                                <Text className="text-white font-firs-medium text-base ml-2">
                                    Gerenciar Catalogo de Exercicios
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                <SafeAreaView
                    edges={['bottom']}
                    className="absolute bottom-0 w-full px-5 py-4 bg-[#09090b]/95 border-t border-zinc-800/60"
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${
                            loading || (isEditing && workoutLoading)
                                ? 'bg-zinc-800'
                                : 'bg-[#FFFFFF]'
                        }`}
                        onPress={handleSaveWorkout}
                        disabled={loading || (isEditing && workoutLoading)}
                    >
                        {loading ? (
                            <ActivityIndicator color="#09090b" size="small" />
                        ) : (
                            <>
                                <Text
                                    className={`font-firs-medium text-lg ${
                                        loading ? 'text-zinc-500' : 'text-zinc-900'
                                    }`}
                                >
                                    {isEditing ? 'Atualizar Treino' : 'Salvar Treino'}
                                </Text>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={20}
                                    color="#09090b"
                                />
                            </>
                        )}
                    </TouchableOpacity>
                </SafeAreaView>
            </KeyboardAvoidingView>

            <ExerciseSelector
                visible={showExerciseSelector}
                onClose={() => setShowExerciseSelector(false)}
                onSelectExercise={handleAddExercise}
                exercises={catalogExercises}
                loading={catalogLoading}
                onManageExercises={handleOpenExerciseCatalog}
            />
        </SafeAreaView>
    );
}
