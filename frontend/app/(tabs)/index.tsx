import React, { useState, useCallback } from 'react';
import {
  View,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StreakCard from '@/components/ui/cards/StreakCard';
import ScalesCard from '@/components/ui/cards/ScalesCard';
import WaterCard from '@/components/ui/cards/WaterCard';
import WorkoutCard from '@/components/ui/cards/WorkoutCard';
import HomeCalendar from '@/components/ui/calendar/HomeCalendar';
import NavigationHud from '@/components/ui/navgation/NavgationHud';
import WeeklyPRCard from '@/components/ui/cards/WeeklyPRCard';
import { useWorkouts } from '@/hooks/useWorkouts';
import { isSameWeekday } from '@/utils/date';
import theme from '@/constants/theme';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { workouts, loading, refetch } = useWorkouts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const workoutForDate = workouts.find((w) => {
    return isSameWeekday(w.date, selectedDate);
  });

  const numColumns = 2;
  const gap = 16;
  const itemWidth = (width - 32 - gap) / numColumns;

  const cards = [
    { id: '1', component: StreakCard },
    { id: '2', component: ScalesCard },
    { id: '3', component: WaterCard },
    { id: '4', component: WorkoutCard, data: workoutForDate, selectedDate },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-canvas"
      edges={['left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand}
          />
        }
      >
        <NavigationHud selectedDate={selectedDate} />

        <View className="px-5">
          <HomeCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </View>

        {loading && workouts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color={theme.colors.brand} />
            <Text className="text-foreground-muted mt-4 font-firs-regular">
              Carregando treinos...
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 16,
                paddingVertical: 16,
                justifyContent: 'space-between',
              }}
            >
              {cards.map((item) => {
                const Card = item.component;
                return (
                  <View
                    key={item.id}
                    style={{
                      width: itemWidth,
                      height: itemWidth,
                      marginBottom: gap,
                    }}
                  >
                    <Card data={item.data} selectedDate={item.selectedDate} />
                  </View>
                );
              })}
            </View>

            <View style={{ paddingHorizontal: 16 }}>
              <WeeklyPRCard workouts={workouts} />
            </View>
          </>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

