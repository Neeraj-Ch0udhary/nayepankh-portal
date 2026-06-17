import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii, cardShadow } from "../../lib/theme";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [certInfo, setCertInfo] = useState(null);

  useEffect(() => {
    api.get("/volunteers/profile").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/certificates/check").then((r) => setCertInfo(r.data)).catch(() => {});
  }, []);

  const confirmLogout = () => {
    Alert.alert("Log out", "You'll need to log in again to access your tasks and events.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: handleLogout },
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const progress = certInfo ? Math.min((certInfo.tasks_completed / 5) * 100, 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === "admin" && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Certificate progress</Text>
            <Text style={styles.sectionTitleEmoji}>🎓</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {certInfo?.tasks_completed || 0} of 5 tasks completed
            {certInfo?.eligible ? " — you're eligible! 🎉" : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile details</Text>
          <Row label="City" value={profile?.city} />
          <Row label="Phone" value={profile?.phone} />
          <Row label="Availability" value={profile?.availability} />
          <Row label="Skills" value={profile?.skills?.join(", ")} />
          <Row label="Tasks completed" value={profile?.tasks_completed ?? 0} last />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: colors.forest,
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.marigold, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  avatarText: { fontSize: 28, fontWeight: "800", color: colors.forestDark },
  name: { fontSize: 19, fontWeight: "800", color: colors.cream },
  email: { fontSize: 13, color: "rgba(251,246,236,0.7)", marginTop: 2 },
  roleBadge: { marginTop: spacing.sm, backgroundColor: "rgba(251,246,236,0.15)", paddingVertical: 4, paddingHorizontal: 12, borderRadius: radii.pill },
  roleBadgeText: { color: colors.marigoldLight, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  section: { backgroundColor: colors.card, margin: spacing.lg, marginBottom: 0, borderRadius: radii.md, padding: spacing.md, ...cardShadow },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontWeight: "700", fontSize: 14, color: colors.charcoal, marginBottom: spacing.sm },
  sectionTitleEmoji: { fontSize: 16 },
  progressBar: { height: 8, backgroundColor: colors.cream, borderRadius: radii.pill, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: colors.marigold, borderRadius: radii.pill },
  progressText: { fontSize: 12, color: colors.charcoalSoft },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cream },
  label: { color: colors.charcoalSoft, fontSize: 13 },
  value: { color: colors.charcoal, fontSize: 13, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  logoutBtn: { margin: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, borderWidth: 1.5, borderColor: colors.terracotta },
  logoutText: { color: colors.terracotta, textAlign: "center", fontWeight: "700", fontSize: 14 },
});