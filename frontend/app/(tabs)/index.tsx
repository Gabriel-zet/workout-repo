import  StreakCard  from '@/components/ui/cards/StreakCard';
import  ScalesCard  from '@/components/ui/cards/ScalesCard';
import WaterCard from '@/components/ui/cards/WaterCard';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 16 }}>
      <StreakCard />
      <ScalesCard />
      <WaterCard />
    </ScrollView>
  );
}

// const styles = StyleSheet.create({

// });
