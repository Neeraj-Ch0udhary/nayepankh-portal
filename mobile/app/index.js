import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii } from "../lib/theme";

const { width } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)/home");
  }, [loading, user]);

  if (loading) return null;

  return (
    <View style={styles.root}>
      {/* Feather arc — signature element */}
      <View style={styles.featherArc} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Text style={styles.eyebrow}>UP GOVT. REGISTERED NGO</Text>
          <Text style={styles.title}>Wings for the{"\n"}ones we lift up</Text>
          <Text style={styles.subtitle}>
            NayePankh runs on people who show up. Food drives, classrooms,
            clothing camps — pick a cause, claim a task, see what it does.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>2,00,000+</Text>
            <Text style={styles.statLabel}>people reached</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>30,000+</Text>
            <Text style={styles.statLabel}>interns trained</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/register")} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Become a volunteer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/login")} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forest },
  featherArc: {
    position: "absolute",
    top: -width * 0.6,
    right: -width * 0.35,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.marigold,
    opacity: 0.16,
  },
  safe: { flex: 1, justifyContent: "space-between", padding: spacing.lg },
  top: { marginTop: spacing.lg },
  eyebrow: { color: colors.marigoldLight, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: spacing.md },
  title: { color: colors.cream, fontSize: 38, fontWeight: "800", lineHeight: 42, marginBottom: spacing.md },
  subtitle: { color: "rgba(251,246,236,0.78)", fontSize: 15, lineHeight: 22, maxWidth: "92%" },
  statsRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.lg },
  statBox: { flex: 1 },
  statValue: { color: colors.cream, fontSize: 22, fontWeight: "800" },
  statLabel: { color: "rgba(251,246,236,0.6)", fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(251,246,236,0.2)", marginHorizontal: spacing.md },
  bottom: { marginBottom: spacing.sm },
  primaryBtn: { backgroundColor: colors.marigold, paddingVertical: 17, borderRadius: radii.md, marginBottom: spacing.sm },
  primaryBtnText: { color: colors.forestDark, fontWeight: "800", fontSize: 16, textAlign: "center" },
  secondaryBtn: { paddingVertical: 14 },
  secondaryBtnText: { color: colors.cream, fontWeight: "600", fontSize: 14, textAlign: "center" },
});