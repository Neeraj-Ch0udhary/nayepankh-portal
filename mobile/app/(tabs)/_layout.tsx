import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Chatbot from "../../components/Chatbot";
import { colors, spacing, radii } from "../../lib/theme";

function TabIcon({ name, focused, label }) {
  return (
    <View style={styles.tabIconWrap}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        <Ionicons name={name} size={20} color={focused ? colors.cream : colors.charcoalSoft} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: { paddingTop: 6 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} label="Home" /> }}
        />
        <Tabs.Screen
          name="tasks"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name="checkmark-done" focused={focused} label="Tasks" /> }}
        />
        <Tabs.Screen
          name="events"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} label="Events" /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} label="Profile" /> }}
        />
      </Tabs>
      <Chatbot />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 14,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIconWrap: { alignItems: "center", justifyContent: "center", gap: 4, width: 64 },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPillActive: { backgroundColor: colors.forest },
  tabLabel: { fontSize: 11, color: colors.charcoalSoft, fontWeight: "600" },
  tabLabelActive: { color: colors.forest, fontWeight: "800" },
});