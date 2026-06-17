import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { colors, spacing, radii } from "../lib/theme";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      await login(res.data.token, res.data.user);
      router.replace("/(tabs)/home");
    } catch (err) {
      // Network error — backend not reachable
      if (!err.response) {
        Alert.alert(
          "Can't reach server",
          "Make sure your Flask backend is running and run:\nadb reverse tcp:5000 tcp:5000"
        );
        return;
      }
      // Backend returned an error
      const msg = err.response.data?.error || "Something went wrong";
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("email")) {
        setErrors({ password: "Invalid email or password" });
      } else {
        Alert.alert("Login failed", msg);
      }
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

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={28} color={colors.cream} />
            </View>
            <Text style={styles.brandName}>NayePankh</Text>
            <Text style={styles.brandTagline}>Volunteer. Grow. Inspire.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to continue making a difference</Text>

            {/* Email */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
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
                returnKeyType="next"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={[styles.inputWrap, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.charcoalSoft} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.charcoalSoft}
                value={form.password}
                onChangeText={(t) => set("password", t)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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

            {/* Login button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.btnText}>Logging in…</Text>
              ) : (
                <>
                  <Text style={styles.btnText}>Log in</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.cream} style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerWrap}>
            <Text style={styles.registerText}>
              New here?{"  "}
              <Text style={styles.registerBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.lg, paddingTop: spacing.xl * 1.5, paddingBottom: 40 },

  brand: { alignItems: "center", marginBottom: spacing.xl },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.forest,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.sm,
  },
  brandName: { fontSize: 26, fontWeight: "800", color: colors.charcoal },
  brandTagline: { fontSize: 13, color: colors.charcoalSoft, marginTop: 2 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.charcoal, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.charcoalSoft, marginBottom: spacing.lg },

  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: colors.charcoalSoft,
    letterSpacing: 0.8, marginBottom: 6, marginTop: spacing.sm,
  },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    borderWidth: 1.5, borderColor: colors.border,
    marginBottom: 2,
  },
  inputError: { borderColor: colors.terracotta },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, padding: 14, fontSize: 15, color: colors.charcoal },
  eyeBtn: { paddingRight: 14, paddingLeft: 6 },
  errorText: { fontSize: 12, color: colors.terracotta, marginBottom: 4, marginLeft: 2 },

  btn: {
    backgroundColor: colors.forest,
    padding: 16, borderRadius: radii.md,
    marginTop: spacing.md,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.cream, fontWeight: "700", fontSize: 16 },

  registerWrap: { alignItems: "center" },
  registerText: { fontSize: 14, color: colors.charcoalSoft },
  registerBold: { color: colors.forest, fontWeight: "700" },
});
