import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useExercises } from '@/hooks/useExercises';
import theme from '@/constants/theme';

export default function ExercisesScreen() {
    const insets = useSafeAreaInsets();
    const { exercises, loading, error, refetch, createExercise, deleteExercise } =
        useExercises();
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const exerciseCountLabel = useMemo(() => {
        const count = exercises.length;
        return `${count} exercicio${count === 1 ? '' : 's'} no catalogo`;
    }, [exercises.length]);

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await refetch({ force: true });
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const handleCreateExercise = useCallback(async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            Alert.alert('Nome obrigatorio', 'Digite o nome do exercicio antes de salvar.');
            return;
        }

        try {
            setSubmitting(true);
            await createExercise(trimmedName);
            setName('');
        } catch (err: any) {
            console.error('Create exercise failed:', err);
            Alert.alert('Nao foi possivel criar', err.message || 'Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    }, [createExercise, name]);

    const handleDeleteExercise = useCallback(
        (id: string, exerciseName: string) => {
            Alert.alert(
                'Remover exercicio',
                `Deseja remover "${exerciseName}" do catalogo?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Remover',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteExercise(id);
                            } catch (err: any) {
                                console.error('Delete exercise failed:', err);
                                Alert.alert(
                                    'Nao foi possivel remover',
                                    err.message ||
                                    'Esse exercicio pode estar em uso em algum treino.'
                                );
                            }
                        },
                    },
                ]
            );
        },
        [deleteExercise]
    );

    return (
        <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right', 'bottom']}>
            <View className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
                <Text className="text-foreground text-4xl font-firs-black mb-2">
                    Exercicios
                </Text>
                <Text className="text-foreground-muted text-base font-firs-regular">
                    Crie seu catalogo pessoal para montar treinos mais rapido.
                </Text>
            </View>

            <View className="px-6 mb-6">
                <View className="bg-surface rounded-[28px] p-5 border border-outline-subtle">
                    <Text className="text-foreground font-firs-bold text-lg mb-4">
                        Novo exercicio
                    </Text>
                    <TextInput
                        className="bg-surface-muted text-foreground rounded-2xl px-4 py-4 font-firs-regular"
                        placeholder="Ex.: Supino Inclinado"
                        placeholderTextColor={theme.colors.textSubtle}
                        value={name}
                        onChangeText={setName}
                        maxLength={80}
                    />
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            handleCreateExercise().catch(() => undefined);
                        }}
                        disabled={submitting}
                        className={`mt-4 rounded-2xl py-4 flex-row items-center justify-center ${submitting ? 'bg-surface-muted' : 'bg-white'
                            }`}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={theme.colors.textInverse} />
                        ) : (
                            <>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={20}
                                    color={theme.colors.textInverse}
                                />
                                <Text className="text-foreground-inverse font-firs-bold ml-2">
                                    Salvar exercicio
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="px-6 mb-4 flex-row items-center justify-between">
                <View>
                    <Text className="text-foreground font-firs-bold text-xl">Catalogo</Text>
                    <Text className="text-foreground-muted font-firs-regular text-sm">
                        {exerciseCountLabel}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        handleRefresh().catch(() => undefined);
                    }}
                    className="w-11 h-11 rounded-full bg-surface-elevated border border-outline-subtle items-center justify-center"
                >
                    <MaterialCommunityIcons
                        name="refresh"
                        size={20}
                        color={theme.colors.surfaceContrast}
                    />
                </TouchableOpacity>
            </View>

            {loading && exercises.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={theme.colors.surfaceContrast} />
                    <Text className="text-foreground-muted font-firs-regular mt-4">
                        Carregando exercicios...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={exercises}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.brand}
                        />
                    }
                    ListEmptyComponent={
                        <View className="bg-surface rounded-[28px] border border-outline-subtle p-8 items-center mt-2">
                            <View className="w-14 h-14 rounded-full bg-surface-muted items-center justify-center mb-4">
                                <MaterialCommunityIcons
                                    name="dumbbell"
                                    size={24}
                                    color={theme.colors.brand}
                                />
                            </View>
                            <Text className="text-foreground font-firs-bold text-lg text-center">
                                Nenhum exercicio cadastrado
                            </Text>
                            <Text className="text-foreground-muted font-firs-regular text-sm text-center mt-2">
                                Crie o primeiro exercicio para ele aparecer no seletor do treino.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-surface rounded-[24px] border border-outline-subtle p-5 mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 pr-4">
                                <View className="w-12 h-12 rounded-full bg-surface-muted items-center justify-center mr-4">
                                    <MaterialCommunityIcons
                                        name="dumbbell"
                                        size={20}
                                        color={theme.colors.brand}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-firs-bold text-base">
                                        {item.name}
                                    </Text>
                                    <Text className="text-foreground-muted font-firs-regular text-sm mt-1">
                                        Disponivel para adicionar aos treinos
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleDeleteExercise(item.id, item.name)}
                                className="w-11 h-11 rounded-full bg-danger-soft items-center justify-center"
                            >
                                <MaterialCommunityIcons
                                    name="trash-can-outline"
                                    size={20}
                                    color={theme.colors.danger}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListFooterComponent={
                        error ? (
                            <Text className="text-red-400 font-firs-regular text-sm mt-3 text-center">
                                {error}
                            </Text>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}
