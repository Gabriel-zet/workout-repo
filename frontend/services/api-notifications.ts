export type ApiNotificationType = 'error' | 'warning' | 'success' | 'info';

export interface ApiNotificationInput {
    type?: ApiNotificationType;
    title: string;
    message?: string;
    meta?: string;
    duration?: number;
}

export interface ApiNotification extends ApiNotificationInput {
    id: string;
    type: ApiNotificationType;
    createdAt: number;
    duration: number;
}

type ApiNotificationListener = (notification: ApiNotification) => void;

const listeners = new Set<ApiNotificationListener>();
let notificationSequence = 0;

function notify(input: ApiNotificationInput): ApiNotification {
    const notification: ApiNotification = {
        id: `${Date.now()}-${notificationSequence++}`,
        type: input.type ?? 'info',
        title: input.title,
        message: input.message,
        meta: input.meta,
        duration: input.duration ?? 4200,
        createdAt: Date.now(),
    };

    listeners.forEach((listener) => listener(notification));
    return notification;
}

export const apiNotifications = {
    notify,
    subscribe(listener: ApiNotificationListener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};
