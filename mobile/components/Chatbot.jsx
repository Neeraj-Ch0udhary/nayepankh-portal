import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { colors, spacing, radii } from "../lib/theme";

const QUICK_REPLIES = [
  "What does NayePankh do?",
  "How do I become a volunteer?",
  "How do I get a certificate?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Pankh 🕊️ — ask me anything about NayePankh Foundation!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async (text) => {
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/", {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting. Try again!" }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSend = () => {
    if (input.trim()) send(input.trim());
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Ionicons name="chatbubble-ellipses" size={26} color={colors.cream} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerEmoji}>🕊️</Text>
              <Text style={styles.headerTitle}>Pankh — AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={24} color={colors.cream} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
                <Text style={item.role === "user" ? styles.userText : styles.botText}>{item.content}</Text>
              </View>
            )}
            ListFooterComponent={
              loading ? (
                <View style={[styles.bubble, styles.botBubble]}>
                  <ActivityIndicator size="small" color={colors.forest} />
                </View>
              ) : null
            }
          />

          {messages.length <= 1 && (
            <View style={styles.quickReplies}>
              {QUICK_REPLIES.map((q) => (
                <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => send(q)} activeOpacity={0.8}>
                  <Text style={styles.quickBtnText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.charcoalSoft}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
              <Ionicons name="send" size={18} color={colors.cream} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 999,
  },
  modalContainer: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: colors.forest,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 18 },
  headerTitle: { color: colors.cream, fontWeight: "700", fontSize: 16 },
  messagesList: { padding: spacing.md, gap: 8 },
  bubble: { padding: 12, borderRadius: radii.md, maxWidth: "82%", marginBottom: 8 },
  userBubble: { backgroundColor: colors.forest, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: colors.card, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userText: { color: colors.cream, fontSize: 14, lineHeight: 20 },
  botText: { color: colors.charcoal, fontSize: 14, lineHeight: 20 },
  quickReplies: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: 8 },
  quickBtn: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.sm },
  quickBtnText: { color: colors.forest, fontSize: 13, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: 14,
    color: colors.charcoal,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
});