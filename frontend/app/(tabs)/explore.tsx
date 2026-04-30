import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Feather,
    FontAwesome5,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import theme from '@/constants/theme';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { removeProfilePhoto, saveProfilePhoto } from '@/services/profile-photo-storage';

type SettingsRowProps = {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
    danger?: boolean;
    first?: boolean;
    last?: boolean;
};

function SettingsRow({
    icon,
    title,
    subtitle,
    value,
    onPress,
    showChevron = true,
    rightElement,
    danger = false,
    first = false,
    last = false,
}: SettingsRowProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            className={`bg-surface-elevated px-4 py-4 ${first ? 'rounded-t-[22px]' : ''} ${last ? 'rounded-b-[22px]' : ''}`}
            disabled={!onPress && !rightElement}
        >
            <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted">
                    {icon}
                </View>

                <View className="flex-1">
                    <Text
                        className={`text-[15px] font-firs-medium ${danger ? 'text-danger' : 'text-foreground'}`}
                    >
                        {title}
                    </Text>

                    {subtitle ? (
                        <Text className="mt-1 text-[13px] font-firs-regular text-foreground-muted">
                            {subtitle}
                        </Text>
                    ) : null}
                </View>

                {value ? (
                    <Text className="mr-2 text-[14px] font-firs-regular text-foreground-muted">
                        {value}
                    </Text>
                ) : null}

                {rightElement ? (
                    rightElement
                ) : showChevron ? (
                    <Feather
                        name="chevron-right"
                        size={18}
                        color={theme.colors.textSubtle}
                    />
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Text className="mb-3 px-1 text-[13px] font-firs-medium text-foreground-muted">
            {children}
        </Text>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut, createdAt } = useAuth();
    const insets = useSafeAreaInsets();
    const { photoUri } = useProfilePhoto();

    const [isLoading, setIsLoading] = useState(false);
    const [isPhotoSaving, setIsPhotoSaving] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const joinedDate = useMemo(() => {
        if (!createdAt) return 'Membro recente';

        return createdAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }, [createdAt]);

    const handleLogout = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await signOut();
                        } catch (error) {
                            console.error('Logout failed:', error);
                            Alert.alert('Erro', 'Não foi possível sair');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleChangePhoto = async () => {
        try {
            console.log('[profile-photo] change button pressed');
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('[profile-photo] media permission:', permission);

            if (!permission.granted) {
                Alert.alert(
                    'Permissão necessária',
                    'Permita o acesso à galeria para escolher sua foto.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.6,
                base64: true,
                legacy: Platform.OS === 'android',
            });
            console.log('[profile-photo] picker result canceled:', result.canceled);

            if (result.canceled || result.assets.length === 0) {
                return;
            }

            setIsPhotoSaving(true);
            await saveProfilePhoto(result.assets[0]);
            console.log('[profile-photo] photo saved locally');
        } catch (error) {
            console.error('Profile photo update failed:', error);
            Alert.alert('Erro', 'Não foi possível atualizar sua foto.');
        } finally {
            setIsPhotoSaving(false);
        }
    };

    const handleRemovePhoto = () => {
        if (!photoUri) {
            return;
        }

        Alert.alert(
            'Remover foto',
            'Deseja remover a foto salva neste aparelho?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsPhotoSaving(true);
                            await removeProfilePhoto();
                        } catch (error) {
                            console.error('Profile photo removal failed:', error);
                            Alert.alert(
                                'Erro',
                                'Não foi possível remover sua foto.'
                            );
                        } finally {
                            setIsPhotoSaving(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="px-6 pb-6" style={{ paddingTop: insets.top + 12 }}>
                    <View className="mb-8 flex-row items-center justify-between">
                        <TouchableOpacity
                            className="h-11 w-11 items-center justify-center rounded-full border border-outline-subtle bg-surface-elevated"
                            activeOpacity={0.85}
                            onPress={() => router.back()}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        <Text className="text-[20px] font-firs-bold text-foreground">
                            Perfil
                        </Text>

                        <TouchableOpacity
                            className="h-11 w-11 items-center justify-center rounded-full border border-outline-subtle bg-surface-elevated"
                            activeOpacity={0.85}
                        >
                            <Feather name="more-horizontal" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-8 overflow-hidden rounded-[28px] border border-outline-subtle bg-surface-soft">
                        <View className="relative">
                            <View className="h-28 bg-surface-muted" />
                            <View className="absolute right-5 top-0 my-4 flex-row items-center gap-2">
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    className="rounded-full border border-outline bg-surface-muted px-4 py-2"
                                    onPress={handleChangePhoto}
                                    disabled={isPhotoSaving}
                                >
                                    {isPhotoSaving ? (
                                        <ActivityIndicator
                                            color="#ffffff"
                                            size="small"
                                        />
                                    ) : (
                                        <Text className="text-[13px] font-firs-medium text-foreground">
                                            {photoUri
                                                ? 'Trocar foto'
                                                : 'Escolher foto'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                {photoUri ? (
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={handleRemovePhoto}
                                        disabled={isPhotoSaving}
                                        className="rounded-full border border-outline bg-surface-muted px-4 py-2"
                                    >
                                        <Text className="text-[13px] font-firs-medium text-foreground">
                                            Remover
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        <View className="px-5 pb-5">
                            <View className="-mt-10 mb-4 flex-row items-end justify-between">
                                {photoUri ? (
                                    <Image
                                        source={{ uri: photoUri }}
                                        className="h-20 w-20 rounded-full border-4 border-surface-soft bg-brand-primary"
                                    />
                                ) : (
                                    <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-surface-soft bg-brand-primary">
                                        <FontAwesome5
                                            name="user"
                                            size={30}
                                            color="white"
                                        />
                                    </View>
                                )}
                            </View>

                            <Text className="text-[24px] font-firs-bold text-foreground">
                                {user?.name || 'Usuário'}
                            </Text>

                            <View className="mt-2 flex-row items-center">
                                <Feather
                                    name="calendar"
                                    size={13}
                                    color={theme.colors.textSubtle}
                                />
                                <Text className="ml-2 text-[13px] font-firs-regular text-foreground-muted">
                                    Membro desde {joinedDate}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="mb-7">
                        <SectionTitle>Conta</SectionTitle>

                        <SettingsRow
                            first
                            icon={<Feather name="edit-2" size={17} color="#fff" />}
                            title="Editar perfil"
                            subtitle="Atualize seus dados pessoais"
                            onPress={() => { }}
                        />

                        <View className="h-px bg-outline" />

                        <SettingsRow
                            icon={<Feather name="lock" size={17} color="#fff" />}
                            title="Alterar senha"
                            subtitle="Gerencie sua segurança"
                            onPress={() => { }}
                        />

                        <View className="h-px bg-outline" />

                        <SettingsRow

                            icon={
                                <MaterialCommunityIcons
                                    name="book"
                                    size={18}
                                    color="#fff"
                                />
                            }
                            title="Meus Treinos"
                            subtitle="Gerencie todos os seus treinos salvos"
                            onPress={() => router.push('/workouts-list')}
                        />

                        <View className="h-px bg-outline" />

                        <SettingsRow
                            last
                            icon={
                                <MaterialCommunityIcons
                                    name="dumbbell"
                                    size={18}
                                    color="#fff"
                                />
                            }
                            title="Meus exercícios"
                            subtitle="Gerencie o catálogo usado nos treinos"
                            onPress={() => router.push('/exercises')}
                        />
                    </View>


                    <View className="mb-7">
                        <SectionTitle>Preferências</SectionTitle>

                        <SettingsRow
                            first
                            icon={<Feather name="bell" size={17} color="#fff" />}
                            title="Notificações"
                            subtitle="Lembretes e avisos do app"
                            showChevron={false}
                            rightElement={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{
                                        false: theme.colors.outlineStrong,
                                        true: theme.colors.brand,
                                    }}
                                    thumbColor="#fff"
                                />
                            }
                        />

                        <View className="h-px bg-outline" />

                        <SettingsRow
                            last
                            icon={<Feather name="settings" size={17} color="#fff" />}
                            title="Configurações"
                            subtitle="Preferências do aplicativo"
                            onPress={() => { }}
                        />
                    </View>

                    <View className="mb-7">
                        <SectionTitle>Suporte</SectionTitle>

                        <SettingsRow
                            first
                            icon={<Feather name="info" size={17} color="#fff" />}
                            title="Sobre o aplicativo"
                            onPress={() => { }}
                        />

                        <View className="h-px bg-outline" />

                        <SettingsRow
                            last
                            icon={<Feather name="message-circle" size={17} color="#fff" />}
                            title="Fale conosco"
                            onPress={() => { }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isLoading}
                        activeOpacity={0.85}
                        className="mb-5 h-14 items-center justify-center rounded-[22px] border border-outline-subtle bg-surface-elevated"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text className="text-[15px] font-firs-medium text-foreground">
                                Sair da conta
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8}
                        className="py-2 mb-5 h-14 items-center justify-center rounded-[22px] border border-outline-subtle bg-red-500">
                        <Text className="text-[15px] font-firs-medium text-white">
                            Excluir conta
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
