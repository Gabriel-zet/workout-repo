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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useExercises } from '@/hooks/useExercises';

export default function ExercisesScreen() {
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
            await refetch();
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
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <View className="px-6 pt-8 pb-6">
                <Text className="text-white text-4xl font-firs-black mb-2">
                    Exercicios
                </Text>
                <Text className="text-zinc-400 text-base font-firs-regular">
                    Crie seu catalogo pessoal para montar treinos mais rapido.
                </Text>
            </View>

            <View className="px-6 mb-6">
                <View className="bg-[#121212] rounded-[28px] p-5 border border-zinc-800">
                    <Text className="text-white font-firs-bold text-lg mb-4">
                        Novo exercicio
                    </Text>
                    <TextInput
                        className="bg-zinc-900 text-white rounded-2xl px-4 py-4 font-firs-regular"
                        placeholder="Ex.: Supino Inclinado"
                        placeholderTextColor="#71717a"
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
                        className={`mt-4 rounded-2xl py-4 flex-row items-center justify-center ${
                            submitting ? 'bg-zinc-800' : 'bg-[#FF6B00]'
                        }`}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#09090b" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="plus" size={20} color="#09090b" />
                                <Text className="text-[#09090b] font-firs-bold ml-2">
                                    Salvar exercicio
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="px-6 mb-4 flex-row items-center justify-between">
                <View>
                    <Text className="text-white font-firs-bold text-xl">Catalogo</Text>
                    <Text className="text-zinc-500 font-firs-regular text-sm">
                        {exerciseCountLabel}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        handleRefresh().catch(() => undefined);
                    }}
                    className="w-11 h-11 rounded-full bg-zinc-900 items-center justify-center"
                >
                    <MaterialCommunityIcons name="refresh" size={20} color="#FF6B00" />
                </TouchableOpacity>
            </View>

            {loading && exercises.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text className="text-zinc-400 font-firs-regular mt-4">
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
                            tintColor="#FF6B00"
                        />
                    }
                    ListEmptyComponent={
                        <View className="bg-[#121212] rounded-[28px] p-8 items-center mt-2">
                            <View className="w-14 h-14 rounded-full bg-zinc-900 items-center justify-center mb-4">
                                <MaterialCommunityIcons
                                    name="dumbbell"
                                    size={24}
                                    color="#FF6B00"
                                />
                            </View>
                            <Text className="text-white font-firs-bold text-lg text-center">
                                Nenhum exercicio cadastrado
                            </Text>
                            <Text className="text-zinc-500 font-firs-regular text-sm text-center mt-2">
                                Crie o primeiro exercicio para ele aparecer no seletor do treino.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-[#121212] rounded-[24px] p-5 mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 pr-4">
                                <View className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center mr-4">
                                    <MaterialCommunityIcons
                                        name="dumbbell"
                                        size={20}
                                        color="#FF6B00"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-firs-bold text-base">
                                        {item.name}
                                    </Text>
                                    <Text className="text-zinc-500 font-firs-regular text-sm mt-1">
                                        Disponivel para adicionar aos treinos
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleDeleteExercise(item.id, item.name)}
                                className="w-11 h-11 rounded-full bg-red-500/10 items-center justify-center"
                            >
                                <MaterialCommunityIcons
                                    name="trash-can-outline"
                                    size={20}
                                    color="#f87171"
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
