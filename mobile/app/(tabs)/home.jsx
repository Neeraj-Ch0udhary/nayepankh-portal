import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii, cardShadow } from "../../lib/theme";

export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    api.get("/tasks/?status=open").then((r) => setTasks(r.data.slice(0, 3))).catch(() => {});
    api.get("/events/").then((r) => setEvents(r.data.slice(0, 3))).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.greeting}>{user?.name?.split(" ")[0] || "Volunteer"} 👋</Text>
          <Text style={styles.subGreeting}>A few causes near you are looking for hands today.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open tasks</Text>
          {tasks.length === 0 ? (
            <Text style={styles.empty}>No open tasks right now</Text>
          ) : (
            tasks.map((t) => (
              <View key={t.id} style={styles.card}>
                <Text style={styles.cardTitle}>{t.title}</Text>
                <Text style={styles.cardDesc}>{t.description}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming events</Text>
          {events.length === 0 ? (
            <Text style={styles.empty}>No events scheduled</Text>
          ) : (
            events.map((e) => (
              <View key={e.id} style={styles.card}>
                <Text style={styles.cardTitle}>{e.title}</Text>
                <Text style={styles.cardDesc}>📍 {e.location} · 📅 {e.date}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: colors.forest,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  eyebrow: { fontSize: 11, fontWeight: "700", color: colors.marigoldLight, letterSpacing: 1, marginBottom: 6 },
  greeting: { fontSize: 24, fontWeight: "800", color: colors.cream },
  subGreeting: { fontSize: 13, color: "rgba(251,246,236,0.75)", marginTop: 6, lineHeight: 18 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: spacing.sm, color: colors.charcoal },
  card: { backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, ...cardShadow },
  cardTitle: { fontWeight: "700", marginBottom: 4, color: colors.charcoal, fontSize: 14 },
  cardDesc: { color: colors.charcoalSoft, fontSize: 12.5 },
  empty: { color: colors.charcoalSoft, fontSize: 14, fontStyle: "italic" },
});