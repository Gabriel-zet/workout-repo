import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '@/constants/theme';
import { WheelPickerModal } from '../modals/WheelPickerModal';

type SetPerformanceStatus = 'pending' | 'new' | 'equal' | 'improved' | 'decreased';

export interface Set {
    id: string;
    reps: number;
    weight: number;
    completed?: boolean;
    performanceStatus?: SetPerformanceStatus;
}

interface SetManagerProps {
    sets: Set[];
    onAddSet: (reps: number, weight: number) => void;
    onUpdateSet: (setId: string, updates: Partial<Set>) => void;
    onRemoveSet: (setId: string) => void;
    actionMode?: 'default' | 'remove';
    showAddButton?: boolean;
}

function getStatusStyles(status?: SetPerformanceStatus) {
    switch (status) {
        case 'improved':
            return {
                row: 'bg-brand-soft',
                valueColor: theme.colors.brand,
                badgeBackground: theme.colors.brand,
                badgeTextColor: theme.colors.textInverse,
                indicatorBackground: theme.colors.brand,
                indicatorIcon: 'trophy' as const,
                indicatorColor: theme.colors.textInverse,
                indicatorLabel: 'peso maior',
            };
        case 'decreased':
            return {
                row: 'bg-danger-soft',
                valueColor: theme.colors.danger,
                badgeBackground: theme.colors.danger,
                badgeTextColor: theme.colors.textInverse,
                indicatorBackground: theme.colors.danger,
                indicatorIcon: 'trash-can' as const,
                indicatorColor: theme.colors.textInverse,
                indicatorLabel: 'peso menor',
            };
        case 'equal':
            return {
                row: 'bg-success-soft',
                valueColor: theme.colors.success,
                badgeBackground: theme.colors.success,
                badgeTextColor: theme.colors.textInverse,
                indicatorBackground: theme.colors.success,
                indicatorIcon: 'check' as const,
                indicatorColor: theme.colors.textInverse,
                indicatorLabel: 'peso igual',
            };
        case 'new':
            return {
                row: 'bg-white/10',
                valueColor: theme.colors.text,
                badgeBackground: theme.colors.outlineSubtle,
                badgeTextColor: theme.colors.text,
                indicatorBackground: theme.colors.outlineSubtle,
                indicatorIcon: 'clock-outline' as const,
                indicatorColor: theme.colors.text,
                indicatorLabel: 'primeiro registro',
            };
        default:
            return {
                row: 'bg-surface-muted',
                valueColor: theme.colors.text,
                badgeBackground: theme.colors.outlineSubtle,
                badgeTextColor: theme.colors.text,
                indicatorBackground: theme.colors.outlineSubtle,
                indicatorIcon: 'check' as const,
                indicatorColor: theme.colors.text,
                indicatorLabel: 'sem comparacao',
            };
    }
}

export function SetManager({
    sets,
    onAddSet,
    onUpdateSet,
    onRemoveSet,
    actionMode = 'default',
    showAddButton = true,
}: SetManagerProps) {
    const [pickerConfig, setPickerConfig] = useState<{
        visible: boolean;
        type: 'weight' | 'reps';
        setId: string | null;
        initialValue: number;
    }>({ visible: false, type: 'weight', setId: null, initialValue: 0 });

    const openPicker = (type: 'weight' | 'reps', value: number, id: string) => {
        setPickerConfig({ visible: true, type, setId: id, initialValue: value });
    };

    const handleConfirmPicker = (value: number) => {
        if (pickerConfig.setId) {
            onUpdateSet(pickerConfig.setId, { [pickerConfig.type]: value });
        }

        setPickerConfig((prev) => ({ ...prev, visible: false }));
    };

    const addSetLabel = useMemo(() => {
        return sets.length === 0 ? 'Adicionar primeira serie' : 'Adicionar serie';
    }, [sets.length]);

    return (
        <View className="w-full">
            {sets.map((item, index) => {
                const statusStyles = getStatusStyles(item.performanceStatus);

                return (
                    <View
                        key={item.id}
                        className={`flex-row items-center justify-between px-3 py-3 ${statusStyles.row}`}
                    >
                        <View
                            className="h-11 w-11 items-center justify-center rounded-full"
                            style={{ backgroundColor: statusStyles.badgeBackground }}
                        >
                            <Text
                                className="font-firs-bold"
                                style={{ color: statusStyles.badgeTextColor }}
                            >
                                {index + 1}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => openPicker('weight', item.weight, item.id)}
                            className="h-11 w-[104px] flex-row items-center justify-center rounded-2xl bg-surface-soft"
                        >
                            <Text
                                className="mr-1 font-firs-bold"
                                style={{ color: statusStyles.valueColor }}
                            >
                                {item.weight}
                            </Text>
                            <Text
                                className="text-xs"
                                style={{ color: statusStyles.valueColor }}
                            >
                                kg
                            </Text>
                        </TouchableOpacity>

                        <MaterialCommunityIcons
                            name="close"
                            size={14}
                            color={statusStyles.valueColor}
                        />

                        <TouchableOpacity
                            onPress={() => openPicker('reps', item.reps, item.id)}
                            className="h-11 w-[108px] flex-row items-center justify-center rounded-2xl bg-surface-soft"
                        >
                            <Text
                                className="mr-1 font-firs-bold"
                                style={{ color: statusStyles.valueColor }}
                            >
                                {item.reps}
                            </Text>
                            <Text
                                className="text-xs"
                                style={{ color: statusStyles.valueColor }}
                            >
                                reps
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={
                                actionMode === 'remove'
                                    ? () => onRemoveSet(item.id)
                                    : undefined
                            }
                            onLongPress={
                                actionMode === 'default'
                                    ? () => onRemoveSet(item.id)
                                    : undefined
                            }
                            className="h-11 w-11 items-center justify-center rounded-full"
                            style={{
                                backgroundColor:
                                    actionMode === 'remove'
                                        ? theme.colors.dangerSoft
                                        : statusStyles.indicatorBackground,
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={
                                actionMode === 'remove'
                                    ? `Remover serie ${index + 1}`
                                    : `Indicador da serie ${index + 1}: ${statusStyles.indicatorLabel}`
                            }
                        >
                            <MaterialCommunityIcons
                                name={
                                    actionMode === 'remove'
                                        ? 'trash-can-outline'
                                        : statusStyles.indicatorIcon
                                }
                                size={20}
                                color={
                                    actionMode === 'remove'
                                        ? theme.colors.danger
                                        : statusStyles.indicatorColor
                                }
                            />
                        </TouchableOpacity>
                    </View>
                );
            })}

            {showAddButton && (
                <TouchableOpacity
                    onPress={() => {
                        const lastSet = sets[sets.length - 1];

                        onAddSet(
                            lastSet ? lastSet.reps : 10,
                            lastSet ? lastSet.weight : 0
                        );

                    }}
                    className="m-6 flex-row items-center self-start rounded-full bg-surface-muted px-4 py-3"
                >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text className="ml-2 font-firs-medium text-foreground">
                        {addSetLabel}
                    </Text>
                </TouchableOpacity>
            )}

            <WheelPickerModal
                visible={pickerConfig.visible}
                type={pickerConfig.type}
                title={pickerConfig.type === 'weight' ? 'Kilos' : 'Repetições'}
                initialValue={pickerConfig.initialValue}
                onClose={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
                onConfirm={handleConfirmPicker}
            />
        </View>
    );
}
