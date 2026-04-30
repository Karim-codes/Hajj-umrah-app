import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, focused }: { name: IoniconName; color: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.activeIndicator} />}
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Palette.gold,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: 'Flights',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="airplane" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Palette.cardBg,
    borderTopColor: Palette.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 10,
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.gold,
  },
});
