import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import api from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii, cardShadow } from "../../lib/theme";
const FILTERS = [
  { key: "open", label: "Open" },
  { key: "assigned", label: "Assigned" },
  { key: "completed", label: "Done" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("open");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = () => {
    api.get(`/tasks/?status=${filter}`).then((r) => setTasks(r.data)).catch(() => {});
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const apply = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/apply`);
      Alert.alert("Applied", "Your application is in. We'll notify you when it's reviewed.");
    } catch (err) {
      Alert.alert("Couldn't apply", err.response?.data?.error || "Try again in a moment");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchTasks();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>VOLUNTEER WORK</Text>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🪶</Text>
            <Text style={styles.empty}>No {filter} tasks right now</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.due_date && <Text style={styles.dueDate}>{item.due_date}</Text>}
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            {item.required_skills?.length > 0 && (
              <View style={styles.skillsRow}>
                {item.required_skills.map((s) => (
                  <View key={s} style={styles.skillChip}>
                    <Text style={styles.skillText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.status === "open" && (
              <TouchableOpacity style={styles.applyBtn} onPress={() => apply(item.id)} activeOpacity={0.85}>
                <Text style={styles.applyBtnText}>Apply now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { fontSize: 11, fontWeight: "700", color: colors.marigold, letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: "800", color: colors.charcoal },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterBtn: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: radii.pill, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  filterActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  filterText: { color: colors.charcoalSoft, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: colors.cream },
  list: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 100 },
  card: { backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, ...cardShadow },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle: { fontWeight: "700", fontSize: 15, color: colors.charcoal, flex: 1, marginRight: 8 },
  dueDate: { fontSize: 11, color: colors.charcoalSoft, fontWeight: "600" },
  cardDesc: { color: colors.charcoalSoft, fontSize: 13, lineHeight: 18, marginBottom: spacing.sm },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.sm },
  skillChip: { backgroundColor: colors.forest + "12", paddingVertical: 5, paddingHorizontal: 12, borderRadius: radii.pill },
  skillText: { color: colors.forest, fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  applyBtn: { backgroundColor: colors.marigold, paddingVertical: 13, borderRadius: radii.sm, marginTop: 2 },
  applyBtnText: { color: colors.forestDark, textAlign: "center", fontWeight: "800", fontSize: 14, letterSpacing: 0.2 },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  empty: { textAlign: "center", color: colors.charcoalSoft, fontSize: 14 },
});