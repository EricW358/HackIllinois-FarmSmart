import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { useState, useRef } from "react";
import { theme } from "../../../constants/theme";
import { useChat, Message } from "../../../hooks/useChat";

export default function ChatScreen() {
  const { conversation, loading, error, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const content = inputMessage.trim();
    setInputMessage("");
    await sendMessage(content);

    // Scroll to bottom after sending message
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.timestamp.getTime()}
      style={[
        styles.messageBox,
        message.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          message.role === "user"
            ? styles.userMessageText
            : styles.assistantMessageText,
        ]}
      >
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text variant="titleLarge">Smart Farming Assistant</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {conversation.messages.map(renderMessage)}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Ask me anything about farming..."
          style={styles.input}
          multiline
          maxLength={500}
          disabled={loading}
          right={
            <TextInput.Icon
              icon="send"
              disabled={!inputMessage.trim() || loading}
              onPress={handleSend}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 16,
  },
  messageBox: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: theme.colors.surfaceVariant,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: theme.colors.onPrimary,
  },
  assistantMessageText: {
    color: theme.colors.onSurfaceVariant,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  input: {
    backgroundColor: "transparent",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    padding: 16,
  },
});
