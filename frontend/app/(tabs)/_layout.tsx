import React, { ComponentProps, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Octicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IconName = ComponentProps<typeof Octicons>['name'];

type TabConfigItem = {
  label: string;
  icon: IconName;
  activeIcon?: IconName;
};

const TAB_CONFIG: Record<string, TabConfigItem> = {
  index: {
    label: 'Home',
    icon: 'home-fill', // Octicons usa home para outline/default
    activeIcon: 'home-fill', // O Octicons não tem um "home-fill" explícito em algumas versões, mas o padrão já é sólido
  },
  statistics: {
    label: 'Stats',
    icon: 'graph',
    activeIcon: 'graph',
  },
  explore: {
    label: 'Perfil',
    icon: 'person-fill', // Octicons usa person para outline/default
    activeIcon: 'person-fill', // O Octicons não tem um "person-fill" explícito em algumas versões, mas o padrão já é sólido
  },
};

const MORE_ITEMS: { label: string; icon: IconName; path: string }[] = [
  { label: 'Biblioteca', icon: 'book', path: '/workouts-list' },
  { label: 'Exercicios', icon: 'checklist', path: '/exercises' },
];
function TabSurface({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [moreOpen, setMoreOpen] = useState(false);

  const bottomInset = Math.max(insets.bottom, 10);
  const dockWidth = Math.min(width - 24, 390);
  const navWidth = dockWidth - 62;

  const visibleRoutes = state.routes.filter((route) => Boolean(TAB_CONFIG[route.name]));

  const closeMore = () => setMoreOpen(false);

  const openPath = (path: string) => {
    closeMore();
    router.push(path as never);
  };

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset }]}>
        <View style={[styles.dockRow, { width: dockWidth }]}>
          <TabSurface style={[styles.tabBar, { width: navWidth }]}>
            {visibleRoutes.map((route) => {
              const config = TAB_CONFIG[route.name];
              if (!config) return null;

              const routeIndex = state.routes.findIndex((item) => item.key === route.key);
              const isFocused = state.index === routeIndex;
              const { options } = descriptors[route.key];

              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : typeof options.title === 'string'
                    ? options.title
                    : config.label;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  navigation.navigate(route.name as never);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabPressable}
                >
                  <View style={[styles.tabItem, isFocused && styles.tabItemActive]}
                    collapsable={false}>
                    <Octicons
                      name={isFocused ? config.activeIcon ?? config.icon : config.icon}
                      size={22}
                      color={isFocused ? '#FFFFFF' : '#111111'}
                    />

                    {isFocused && (
                      <Text numberOfLines={1} style={styles.activeLabel}>
                        {label}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setMoreOpen(true)}
              style={styles.tabPressable}
            >
              <View style={styles.tabItem}>
                <Octicons name="kebab-horizontal" size={20} color="#111111" />
              </View>
            </Pressable>
          </TabSurface>

          <Pressable
            onPress={() => router.push('/create-workout')}
            style={styles.createButtonPressable}
          >
            <View style={styles.createButton}>
              <Octicons name="plus" size={24} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={closeMore}>
        <Pressable style={styles.modalOverlay} onPress={closeMore}>
          <View style={styles.moreMenuCard}>
            {MORE_ITEMS.map((item, index) => (
              <Pressable key={item.path} onPress={() => openPath(item.path)}>
                <View
                  style={[
                    styles.moreMenuItem,
                    index === MORE_ITEMS.length - 1 && styles.moreMenuItemLast,
                  ]}
                >
                  <View style={styles.moreMenuIcon}>
                    <Octicons name={item.icon} size={18} color="#111111" />
                  </View>
                  <Text style={styles.moreMenuText}>{item.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="statistics" options={{ title: 'Stats' }} />
      <Tabs.Screen name="explore" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tabBar: {
    height: 70,
    paddingVertical: 3,
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tabPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 14,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#111111',
    gap: 6,
    paddingHorizontal: 14,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'TT-Firs-Regular',
    letterSpacing: 0.2,
    textAlignVertical: 'center',
  },
  createButtonPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  createButton: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#FF7B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 90,
    paddingRight: 80,
  },
  moreMenuCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  moreMenuItem: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreMenuItemLast: {
    marginBottom: 2,
  },
  moreMenuIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moreMenuText: {
    color: '#111111',
    fontSize: 15,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }),
  },
});
