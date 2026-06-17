import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { colors, spacing, radii } from "../lib/theme";

const SKILLS = [
  "teaching", "communication", "design", "social media",
  "coding", "writing", "coordination", "data entry",
];

const TOTAL_STEPS = 2;

function StepBar({ step }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} style={styles.stepSegmentWrap}>
          <View style={[
            styles.stepSegment,
            i < step && styles.stepSegmentDone,
            i === step - 1 && styles.stepSegmentActive,
          ]} />
        </View>
      ))}
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    city: "", phone: "", skills: [],
  });

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const toggleSkill = (skill) =>
    set("skills", form.skills.includes(skill)
      ? form.skills.filter((s) => s !== skill)
      : [...form.skills, skill]);

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.city.trim()) e.city = "City is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (form.skills.length === 0) e.skills = "Pick at least one skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      await login(res.data.token, res.data.user);
      await api.post("/volunteers/profile", {
        city: form.city,
        phone: form.phone,
        skills: form.skills,
        availability: "weekends",
      });
      router.replace("/(tabs)/home");
    } catch (err) {
      if (!err.response) {
        Alert.alert("Can't reach server", "Make sure Flask is running and run:\nadb reverse tcp:5000 tcp:5000");
        return;
      }
      Alert.alert("Registration failed", err.response.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Back arrow on step 2 */}
          {step === 2 && (
            <TouchableOpacity style={styles.backArrow} onPress={() => setStep(1)} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          )}

          {/* Step bar */}
          <StepBar step={step} />
          <Text style={styles.stepLabel}>Step {step} of {TOTAL_STEPS}</Text>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <Text style={styles.title}>Who are you?</Text>
              <Text style={styles.subtitle}>Let's start with the basics</Text>

              <Text style={styles.fieldLabel}>FULL NAME <Text style={styles.req}>*</Text></Text>
              <View style={[styles.inputWrap, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Riya Sharma"
                  placeholderTextColor={colors.charcoalSoft}
                  value={form.name}
                  onChangeText={(t) => set("name", t)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.fieldLabel}>EMAIL <Text style={styles.req}>*</Text></Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.charcoalSoft}
                  value={form.email}
                  onChangeText={(t) => set("email", t)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={styles.fieldLabel}>PASSWORD <Text style={styles.req}>*</Text></Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.charcoalSoft}
                  value={form.password}
                  onChangeText={(t) => set("password", t)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.charcoalSoft}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.cream} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <Text style={styles.title}>Where can you help?</Text>
              <Text style={styles.subtitle}>Location and skills</Text>

              <Text style={styles.fieldLabel}>CITY <Text style={styles.req}>*</Text></Text>
              <View style={[styles.inputWrap, errors.city && styles.inputError]}>
                <Ionicons name="location-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Kanpur"
                  placeholderTextColor={colors.charcoalSoft}
                  value={form.city}
                  onChangeText={(t) => set("city", t)}
                />
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

              <Text style={styles.fieldLabel}>PHONE <Text style={styles.req}>*</Text></Text>
              <View style={[styles.inputWrap, errors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.charcoalSoft}
                  value={form.phone}
                  onChangeText={(t) => set("phone", t)}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              <Text style={styles.fieldLabel}>SKILLS <Text style={styles.req}>*</Text></Text>
              <View style={styles.skillsWrap}>
                {SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.skillChip, form.skills.includes(skill) && styles.skillChipActive]}
                    onPress={() => toggleSkill(skill)}
                    activeOpacity={0.8}
                  >
                    {form.skills.includes(skill) && (
                      <Ionicons name="checkmark" size={12} color={colors.cream} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.skillText, form.skills.includes(skill) && styles.skillTextActive]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <Text style={styles.btnText}>Joining…</Text>
                ) : (
                  <>
                    <Ionicons name="leaf-outline" size={18} color={colors.cream} style={{ marginRight: 6 }} />
                    <Text style={styles.btnText}>Join NayePankh</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.push("/login")} style={{ marginTop: spacing.xl }}>
            <Text style={styles.link}>
              Already a member?{"  "}
              <Text style={styles.linkBold}>Log in</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: 40 },

  backArrow: {
    width: 38, height: 38, borderRadius: radii.pill,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.md,
  },

  stepRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  stepSegmentWrap: { flex: 1, height: 4, borderRadius: radii.pill, overflow: "hidden", backgroundColor: colors.border },
  stepSegment: { flex: 1, height: 4, backgroundColor: "transparent" },
  stepSegmentDone: { backgroundColor: colors.forest },
  stepSegmentActive: { backgroundColor: colors.marigold },
  stepLabel: { fontSize: 12, color: colors.charcoalSoft, marginBottom: spacing.lg },

  title: { fontSize: 26, fontWeight: "800", color: colors.charcoal, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.charcoalSoft, marginBottom: spacing.lg },

  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: colors.charcoalSoft,
    letterSpacing: 0.8, marginBottom: 6, marginTop: spacing.sm,
  },
  req: { color: colors.terracotta },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1.5, borderColor: colors.border,
    marginBottom: 2,
  },
  inputError: { borderColor: colors.terracotta },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, padding: 14, fontSize: 15, color: colors.charcoal },
  eyeBtn: { paddingRight: 14, paddingLeft: 6 },
  errorText: { fontSize: 12, color: colors.terracotta, marginBottom: 4, marginLeft: 2 },

  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4, marginBottom: 2 },
  skillChip: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radii.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card,
  },
  skillChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  skillText: { fontSize: 13, color: colors.charcoalSoft },
  skillTextActive: { color: colors.cream, fontWeight: "600" },

  btn: {
    backgroundColor: colors.forest,
    padding: 16, borderRadius: radii.md,
    marginTop: spacing.lg,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.cream, fontWeight: "700", fontSize: 16 },

  link: { textAlign: "center", color: colors.charcoalSoft, fontSize: 14 },
  linkBold: { color: colors.forest, fontWeight: "700" },
});