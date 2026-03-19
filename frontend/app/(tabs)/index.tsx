import { View, useWindowDimensions, FlatList } from 'react-native';
import StreakCard from '@/components/ui/cards/StreakCard';
import ScalesCard from '@/components/ui/cards/ScalesCard';
import WaterCard from '@/components/ui/cards/WaterCard';

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  // Grid 2x2
  const numColumns = 2;
  const gap = 16;
  const itemWidth = (width - 32 - gap * (numColumns - 1)) / numColumns;

  // Array de cards a renderizar
  const cards = [
    { id: '1', component: StreakCard },
    { id: '2', component: ScalesCard },
    { id: '3', component: WaterCard },
    { id: '4', component: StreakCard }, // Exemplo com 4 itens
  ];

  const renderCard = ({ item, index }: { item: typeof cards[0], index: number }) => {
    const Card = item.component;
    const isLastColumn = (index + 1) % numColumns === 0;
    return (
      <View
        style={{
          width: itemWidth,
          marginBottom: gap,
          marginRight: isLastColumn ? 0 : gap,
        }}
      >
        <Card />
      </View>
    );
  };

  return (
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      scrollEnabled={false}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

