import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { color, font } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.inkMuted,
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.border },
        tabBarLabelStyle: { fontFamily: font.bodyBold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color: c, size }) => <Ionicons name="home" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
          tabBarIcon: ({ color: c, size }) => <Ionicons name="time" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color: c, size }) => <Ionicons name="settings-sharp" size={size} color={c} />,
        }}
      />
    </Tabs>
  );
}
