import React, { useState } from 'react';
import { View, useWindowDimensions, ScrollView, SafeAreaView } from 'react-native';
import StreakCard from '@/components/ui/cards/StreakCard';
import ScalesCard from '@/components/ui/cards/ScalesCard';
import WaterCard from '@/components/ui/cards/WaterCard';
import WorkoutCard from '@/components/ui/cards/WorkoutCard';
import HomeCalendar from '@/components/ui/calendar/HomeCalendar';
import NavigationHud from '@/components/ui/navgation/NavgationHud';
import WeeklyPRCard from '@/components/ui/cards/WeeklyPRCard';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Grid 2x2
  const numColumns = 2;
  const gap = 16;
  // Descontando o padding lateral (32 = 16 de cada lado) e o gap central
  const itemWidth = (width - 32 - gap) / numColumns;

  // Array de cards a renderizar
  const cards = [
    { id: '1', component: StreakCard },
    { id: '2', component: ScalesCard },
    { id: '3', component: WaterCard },
    { id: '4', component: WorkoutCard },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#09090b]">
      {/* Trocamos a FlatList por uma ScrollView principal. 
        Isso garante que nada se sobreponha se a tela do celular for menor que o conteúdo.
      */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }} // Dá um respiro no final da tela
      >
        <NavigationHud selectedDate={selectedDate} />

        <HomeCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Grid 2x2 construído com Flexbox (flexWrap).
          Mais leve que a FlatList para poucos itens e não quebra o layout.
        */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            paddingVertical: 16,
            justifyContent: 'space-between' // Espalha os itens automaticamente
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
                <Card />
              </View>
            );
          })}
        </View>

        {/* Envolvendo o componente em uma View com padding para alinhar com o grid */}
        <View style={{ paddingHorizontal: 16 }}>
          <WeeklyPRCard />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}