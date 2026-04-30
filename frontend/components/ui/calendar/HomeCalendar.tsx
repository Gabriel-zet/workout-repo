import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type HomeCalendarProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};

type WeekDay = {
    id: string;
    day: string;
    date: string;
    fullDate: Date;
    active: boolean;
    hasNotification?: boolean;
};

function getWeekDays(selectedDate: Date): WeekDay[] {
    const day = selectedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // começa na segunda

    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() + diff);

    const weekLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        const isSelected =
            date.toDateString() === selectedDate.toDateString();

        days.push({
            id: String(i),
            day: weekLabels[date.getDay()],
            date: String(date.getDate()).padStart(2, '0'),
            fullDate: date,
            active: isSelected,
            hasNotification: isSelected,
        });
    }

    return days;
}

export default function HomeCalendar({
    selectedDate,
    setSelectedDate,
}: HomeCalendarProps) {
    const weekDays = getWeekDays(selectedDate);

    return (
        <View>
            <View className="flex-row justify-between items-center w-full my-5">
                {weekDays.map((item) => {
                    const isActive = item.active;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            onPress={() => setSelectedDate(item.fullDate)}
                            className={`
                                items-center justify-between rounded-2xl
                                ${isActive
                                    ? 'bg-surface-contrast w-[14.2%] py-2 gap-2'
                                    : 'bg-surface-muted w-[13.5%] py-2 gap-1'
                                }
                            `}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text
                                    className={`
                                        font-firs-medium text-sm
                                        ${isActive ? 'text-foreground-inverse' : 'text-foreground-subtle'}
                                    `}
                                    style={{ letterSpacing: 0.5 }}
                                >
                                    {item.day}
                                </Text>

                                {item.hasNotification && isActive && (
                                    <View className="w-[6px] h-[6px] bg-brand-primary rounded-full ml-1.5 mt-[2px]" />
                                )}
                            </View>

                            <Text
                                className={`
                                    ${isActive
                                        ? 'text-foreground-inverse text-3xl font-firs-semibold'
                                        : 'text-foreground-subtle text-xl font-firs-medium'
                                    }
                                `}
                                style={{
                                    lineHeight: isActive ? 28 : 20,
                                    letterSpacing: -1,
                                }}
                            >
                                {item.date}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
