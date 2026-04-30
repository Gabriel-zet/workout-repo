import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import theme from '@/constants/theme';

const ITEM_HEIGHT = 92;
const WHEEL_HEIGHT = ITEM_HEIGHT * 3;
const CENTER_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (value: number) => void;
    title: string;
    initialValue: number;
    type: 'weight' | 'reps';
    subtitle?: string;
}

type WheelColumnProps = {
    data: number[];
    selectedValue: number;
    onChange: (value: number) => void;
    visible: boolean;
    width: number;
    prefix?: string;
};

type WheelItemProps = {
    item: number;
    index: number;
    scrollY: Animated.Value;
    prefix?: string;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

/* ================= ITEM ================= */

const WheelItem = memo(
    ({ item, index, scrollY, prefix = '' }: WheelItemProps) => {
        const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
        ];

        const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.75, 0.88, 1, 0.88, 0.75],
            extrapolate: 'clamp',
        });

        const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.15, 0.35, 1, 0.35, 0.15],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.itemContainer}>
                <Animated.Text
                    style={[
                        styles.itemText,
                        {
                            opacity,
                            transform: [{ scale }],
                        },
                    ]}
                >
                    {prefix}
                    {item}
                </Animated.Text>
            </View>
        );
    }
);
WheelItem.displayName = 'WheelItem';

/* ================= COLUMN ================= */

const WheelColumn = memo(
    ({ data, selectedValue, onChange, visible, width, prefix = '' }: WheelColumnProps) => {
        const listRef = useRef<Animated.FlatList<number>>(null);
        const scrollY = useRef(new Animated.Value(0)).current;
        const selectedValueRef = useRef(selectedValue);
        const snapOffsets = useMemo(
            () => data.map((_, index) => index * ITEM_HEIGHT),
            [data]
        );

        useEffect(() => {
            selectedValueRef.current = selectedValue;
        }, [selectedValue]);

        const commitValue = useCallback(
            (index: number, withHaptics: boolean) => {
                const clampedIndex = clamp(index, 0, data.length - 1);
                const nextValue = data[clampedIndex];

                if (nextValue === selectedValueRef.current) return;

                selectedValueRef.current = nextValue;
                onChange(nextValue);

                if (withHaptics) {
                    Haptics.selectionAsync().catch(() => { });
                }
            },
            [data, onChange]
        );

        const snapToIndex = useCallback(
            (index: number, animated: boolean, withHaptics: boolean) => {
                const clampedIndex = clamp(index, 0, data.length - 1);
                const targetOffset = clampedIndex * ITEM_HEIGHT;

                listRef.current?.scrollToOffset({
                    offset: targetOffset,
                    animated,
                });

                if (!animated) {
                    scrollY.setValue(targetOffset);
                }

                commitValue(clampedIndex, withHaptics);
            },
            [commitValue, data.length, scrollY]
        );

        useEffect(() => {
            if (!visible || data.length === 0) return;

            const idx = data.indexOf(selectedValue);
            if (idx === -1) return;

            requestAnimationFrame(() => {
                snapToIndex(idx, false, false);
            });
        }, [data, selectedValue, snapToIndex, visible]);

        const handleScrollSettled = useCallback(
            (offsetY: number) => {
                const index = Math.round(offsetY / ITEM_HEIGHT);
                snapToIndex(index, true, true);
            },
            [snapToIndex]
        );

        return (
            <View style={{ width, height: WHEEL_HEIGHT }} className="overflow-hidden">
                <Animated.FlatList
                    ref={listRef}
                    data={data}
                    keyExtractor={(item, i) => `${item}-${i}`}
                    bounces={false}
                    overScrollMode="never"
                    decelerationRate="fast"
                    snapToOffsets={snapOffsets}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                        paddingVertical: CENTER_PADDING,
                    }}
                    getItemLayout={(_, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    onMomentumScrollEnd={(e) => {
                        handleScrollSettled(e.nativeEvent.contentOffset.y);
                    }}
                    onScrollEndDrag={(e) => {
                        const velocityY = Math.abs(e.nativeEvent.velocity?.y ?? 0);

                        if (velocityY > 0.05) return;

                        handleScrollSettled(e.nativeEvent.contentOffset.y);
                    }}
                    renderItem={({ item, index }) => (
                        <WheelItem
                            item={item}
                            index={index}
                            scrollY={scrollY}
                            prefix={prefix}
                        />
                    )}
                />
            </View>
        );
    }
);
WheelColumn.displayName = 'WheelColumn';

/* ================= MODAL ================= */

export function WheelPickerModal({
    visible,
    onClose,
    onConfirm,
    title,
    initialValue,
    type,
    subtitle = 'Atualize a tabela de pesos',
}: Props) {
    const [intVal, setIntVal] = useState(0);
    const [decVal, setDecVal] = useState(0);

    useEffect(() => {
        if (!visible) return;

        const int = Math.max(0, Math.floor(initialValue));
        const dec =
            type === 'weight'
                ? clamp(Math.round((initialValue - int) * 10), 0, 9)
                : 0;

        setIntVal(int);
        setDecVal(dec);
    }, [visible, initialValue, type]);

    const integers = useMemo(
        () =>
            Array.from(
                { length: type === 'weight' ? 300 : 100 },
                (_, i) => i
            ),
        [type]
    );

    const decimals = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], []);

    const handleConfirm = useCallback(() => {
        const val =
            type === 'weight'
                ? Number((intVal + decVal / 10).toFixed(1))
                : intVal;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        onConfirm(val);
        onClose();
    }, [decVal, intVal, onClose, onConfirm, type]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-end" style={styles.backdrop}>
                <Pressable className="flex-1" onPress={onClose} />

                <View className="overflow-hidden rounded-t-[32px] bg-surface-strong pt-6 pb-8">
                    <View className="flex-row justify-between px-6 mb-4">
                        <View>
                            <Text className="text-4xl font-firs-medium text-foreground">{title}</Text>
                            <Text className="py-2 text-base font-firs-regular text-foreground-muted">{subtitle}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            className="h-10 w-10 items-center justify-center rounded-full"
                            style={styles.closeButton}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={20}
                                color={theme.colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    <View className="h-[1px] bg-outline-subtle" />

                    <View className="relative py-6">
                        <View className="flex-row justify-center">
                            <WheelColumn
                                data={integers}
                                selectedValue={intVal}
                                onChange={setIntVal}
                                visible={visible}
                                width={150}
                            />

                            {type === 'weight' && (
                                <WheelColumn
                                    data={decimals}
                                    selectedValue={decVal}
                                    onChange={setDecVal}
                                    visible={visible}
                                    width={110}
                                    prefix="."
                                />
                            )}
                        </View>

                        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                            <LinearGradient
                                colors={[theme.colors.surfaceStrong, 'transparent']}
                                style={styles.top}
                            />
                            <LinearGradient
                                colors={['transparent', theme.colors.surfaceStrong]}
                                style={styles.bottom}
                            />
                        </View>
                    </View>

                    <View className="h-[1px] bg-outline-subtle" />

                    <View className="px-6 mt-10">
                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="h-14 items-center justify-center rounded-2xl bg-brand-primary"
                        >
                            <Text className="text-lg font-firs-medium text-foreground-inverse">Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: theme.colors.overlay,
    },
    closeButton: {
        backgroundColor: theme.colors.outlineSubtle,
    },
    itemContainer: {
        height: ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: 76,
        fontFamily: 'TT-Firs-Medium',
        includeFontPadding: false,
        textAlignVertical: 'center',
        color: theme.colors.text,
        letterSpacing: -2,
    },
    top: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 90,
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
    },
});
