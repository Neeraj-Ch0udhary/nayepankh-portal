import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import api from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii, cardShadow } from "../../lib/theme";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = () => {
    api.get("/events/").then((r) => setEvents(r.data)).catch(() => {});
  };

  useEffect(() => { fetchEvents(); }, []);

  const register = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      Alert.alert("You're in!", "We've saved your spot for this event.");
      fetchEvents();
    } catch (err) {
      Alert.alert("Couldn't register", err.response?.data?.error || "Try again in a moment");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchEvents();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SHOW UP IN PERSON</Text>
        <Text style={styles.title}>Events</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.empty}>No upcoming events yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pct = Math.min(Math.round((item.filled_slots / item.total_slots) * 100), 100);
          const full = item.filled_slots >= item.total_slots;
          const almostFull = !full && pct >= 75;
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>📍 {item.location}</Text>
                <Text style={styles.metaText}>📅 {item.date}</Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: full ? colors.terracotta : almostFull ? colors.marigold : colors.forest },
                  ]}
                />
              </View>
              <Text style={styles.slotText}>
                {item.filled_slots} / {item.total_slots} slots filled{almostFull && !full ? " — filling fast" : ""}
              </Text>

              <TouchableOpacity
                style={[styles.registerBtn, full && styles.registerBtnDisabled]}
                onPress={() => register(item.id)}
                disabled={full}
                activeOpacity={0.85}
              >
                <Text style={[styles.registerBtnText, full && styles.registerBtnTextDisabled]}>
                  {full ? "Event full" : "Register now"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { fontSize: 11, fontWeight: "700", color: colors.marigold, letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: "800", color: colors.charcoal },
  list: { padding: spacing.lg, paddingTop: 0, paddingBottom: 100 },
  card: { backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, ...cardShadow },
  cardTitle: { fontWeight: "700", fontSize: 15, color: colors.charcoal, marginBottom: 4 },
  cardDesc: { color: colors.charcoalSoft, fontSize: 13, lineHeight: 18, marginBottom: spacing.sm },
  metaRow: { flexDirection: "row", gap: 14, marginBottom: spacing.sm },
  metaText: { color: colors.charcoalSoft, fontSize: 12, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: colors.cream, borderRadius: radii.pill, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", borderRadius: radii.pill },
  slotText: { fontSize: 11, color: colors.charcoalSoft, marginBottom: spacing.sm },
  registerBtn: { backgroundColor: colors.forest, padding: 12, borderRadius: radii.sm },
  registerBtnDisabled: { backgroundColor: colors.border },
  registerBtnText: { color: colors.cream, textAlign: "center", fontWeight: "700", fontSize: 14 },
  registerBtnTextDisabled: { color: colors.charcoalSoft },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  empty: { textAlign: "center", color: colors.charcoalSoft, fontSize: 14 },
});