import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '@/constants/theme';
import {
    apiNotifications,
    type ApiNotification,
    type ApiNotificationType,
} from '@/services/api-notifications';

const MAX_VISIBLE_NOTIFICATIONS = 3;

const notificationColors: Record<ApiNotificationType, string> = {
    error: theme.colors.danger,
    warning: theme.colors.brandStrong,
    success: theme.colors.success,
    info: theme.colors.textMuted,
};

const notificationIcons: Record<ApiNotificationType, keyof typeof Ionicons.glyphMap> = {
    error: 'alert-circle-outline',
    warning: 'warning-outline',
    success: 'checkmark-circle-outline',
    info: 'information-circle-outline',
};

interface NotificationCardProps {
    notification: ApiNotification;
    onClose: (id: string) => void;
}

function NotificationCard({ notification, onClose }: NotificationCardProps) {
    const progress = useRef(new Animated.Value(0)).current;
    const closingRef = useRef(false);
    const accentColor = notificationColors[notification.type];

    const close = useCallback(() => {
        if (closingRef.current) return;

        closingRef.current = true;
        Animated.timing(progress, {
            toValue: 0,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            onClose(notification.id);
        });
    }, [notification.id, onClose, progress]);

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        const timeout = setTimeout(close, notification.duration);
        return () => clearTimeout(timeout);
    }, [close, notification.duration, progress]);

    const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 0],
    });

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: progress,
                    transform: [{ translateY }],
                    borderLeftColor: accentColor,
                },
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}1A` }]}>
                <Ionicons
                    name={notificationIcons[notification.type]}
                    size={18}
                    color={accentColor}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {notification.title}
                </Text>
                {notification.message ? (
                    <Text style={styles.message} numberOfLines={2}>
                        {notification.message}
                    </Text>
                ) : null}
                {notification.meta ? (
                    <Text style={styles.meta} numberOfLines={1}>
                        {notification.meta}
                    </Text>
                ) : null}
            </View>

            <Pressable
                onPress={close}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar notificacao"
                style={styles.closeButton}
            >
                <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
        </Animated.View>
    );
}

export function ApiNotificationHost() {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);

    useEffect(() => {
        return apiNotifications.subscribe((notification) => {
            setNotifications((current) => [
                notification,
                ...current,
            ].slice(0, MAX_VISIBLE_NOTIFICATIONS));
        });
    }, []);

    const handleClose = useCallback((id: string) => {
        setNotifications((current) =>
            current.filter((notification) => notification.id !== id)
        );
    }, []);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                },
            ]}
        >
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClose={handleClose}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 12,
        right: 12,
        zIndex: 50,
        gap: 8,
    },
    card: {
        minHeight: 64,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.outlineSubtle,
        borderLeftWidth: 3,
        backgroundColor: theme.colors.surfaceElevated,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000000',
        shadowOpacity: 0.24,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    iconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: theme.colors.text,
        fontFamily: 'TT-Firs-DemiBold',
        fontSize: 13,
        lineHeight: 17,
    },
    message: {
        color: theme.colors.textSoft,
        fontFamily: 'TT-Firs-Regular',
        fontSize: 12,
        lineHeight: 16,
        marginTop: 2,
    },
    meta: {
        color: theme.colors.textSubtle,
        fontFamily: 'TT-Firs-Regular',
        fontSize: 10,
        lineHeight: 13,
        marginTop: 3,
    },
    closeButton: {
        width: 26,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
