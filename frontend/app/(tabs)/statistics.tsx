import React from 'react';

import StatisticsScreen from '@/components/screens/StatisticsScreen';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function StatisticsTabScreen() {
    const { workouts, loading } = useWorkouts();

    return <StatisticsScreen workouts={workouts} loading={loading} />;
}
