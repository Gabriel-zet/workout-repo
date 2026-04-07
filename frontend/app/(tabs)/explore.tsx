import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
    Feather,
    FontAwesome5,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

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
            className={`px-4 py-4 bg-[#141416] ${first ? 'rounded-t-[22px]' : ''
                } ${last ? 'rounded-b-[22px]' : ''}`}
            disabled={!onPress && !rightElement}
        >
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-[#1b1b1f] items-center justify-center mr-3">
                    {icon}
                </View>

                <View className="flex-1">
                    <Text
                        className={`text-[15px] ${danger ? 'text-red-400' : 'text-white'
                            } font-firs-medium`}
                    >
                        {title}
                    </Text>

                    {subtitle ? (
                        <Text className="text-zinc-500 text-[13px] mt-1 font-firs-regular">
                            {subtitle}
                        </Text>
                    ) : null}
                </View>

                {value ? (
                    <Text className="text-zinc-400 text-[14px] mr-2 font-firs-regular">
                        {value}
                    </Text>
                ) : null}

                {rightElement ? (
                    rightElement
                ) : showChevron ? (
                    <Feather name="chevron-right" size={18} color="#6b7280" />
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Text className="text-zinc-500 text-[13px] font-firs-medium mb-3 px-1">
            {children}
        </Text>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut, createdAt } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
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

    return (
        <SafeAreaView className="flex-1 bg-[#09090b]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 36 }}
            >
                <View className="px-6 pt-4 pb-6">
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-[#141416] items-center justify-center"
                            activeOpacity={0.85}
                            onPress={() => router.back()}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        <Text className="text-white text-[20px] font-firs-bold">
                            Perfil
                        </Text>

                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-[#141416] items-center justify-center"
                            activeOpacity={0.85}
                        >
                            <Feather name="more-horizontal" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-[#101012] rounded-[28px] overflow-hidden mb-8">
                        <View className="relative">
                            <View className="h-28 bg-[#1a1a1d]" />
                            <View className="absolute -top-0 right-5 my-4">
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    className="bg-[#1a1a1d] px-4 py-2 rounded-full border border-zinc-800"
                                >
                                    <Text className="text-white text-[13px] font-firs-medium">
                                        Editar foto
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="px-5 pb-5">
                            <View className="-mt-10 mb-4 flex-row items-end justify-between">
                                <View className="w-20 h-20 rounded-full bg-orange-600 border-4 border-[#101012] items-center justify-center">
                                    <FontAwesome5 name="user" size={30} color="white" />
                                </View>
                            </View>

                            <Text className="text-white text-[24px] font-firs-bold">
                                {user?.name || 'Usuário'}
                            </Text>

                            <View className="flex-row items-center mt-2">
                                <Feather name="calendar" size={13} color="#71717a" />
                                <Text className="text-zinc-500 text-[13px] ml-2 font-firs-regular">
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

                        <View className="h-px bg-[#232326]" />

                        <SettingsRow
                            icon={<Feather name="lock" size={17} color="#fff" />}
                            title="Alterar senha"
                            subtitle="Gerencie sua segurança"
                            onPress={() => { }}
                        />

                        <View className="h-px bg-[#232326]" />

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
                            last={false}
                            icon={<Feather name="bell" size={17} color="#fff" />}
                            title="Notificações"
                            subtitle="Lembretes e avisos do app"
                            showChevron={false}
                            rightElement={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ false: '#2a2a2e', true: '#FF6800' }}
                                    thumbColor="#fff"
                                />
                            }
                        />

                        <View className="h-px bg-[#232326]" />

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

                        <View className="h-px bg-[#232326]" />

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
                        className="bg-[#141416] rounded-[22px] h-14 items-center justify-center mb-5"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text className="text-white text-[15px] font-firs-medium">
                                Sair da conta
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} className="items-center py-2">
                        <Text className="text-red-400 text-[15px] font-firs-medium">
                            Excluir conta
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
