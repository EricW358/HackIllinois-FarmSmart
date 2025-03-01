import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useChat } from "../../../hooks/useChat";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { conversation, loading, error, sendMessage } = useChat();
  const scrollViewRef = useRef<ScrollView>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImage(base64Image);
    }
  };

  const handleSend = async () => {
    if (input.trim() || selectedImage) {
      const currentImage = selectedImage;
      setSelectedImage(null);
      await sendMessage(
        input.trim() || "Analyze this image",
        currentImage || undefined
      );
      setInput("");
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: any) => (
    <Surface
      key={message.content}
      style={[
        styles.messageBubble,
        message.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {message.image && (
        <Image source={{ uri: message.image }} style={styles.messageImage} />
      )}
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
      <Text
        style={[
          styles.timestamp,
          message.role === "user"
            ? styles.userTimestamp
            : styles.assistantTimestamp,
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </Surface>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {conversation.messages.map(renderMessage)}
        {loading && <ActivityIndicator style={styles.loading} size="small" />}
        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {selectedImage && (
        <View style={styles.selectedImageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <IconButton
            icon="close"
            size={20}
            onPress={() => setSelectedImage(null)}
            style={styles.removeImageButton}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <IconButton
          icon="camera"
          size={24}
          onPress={pickImage}
          style={styles.imageButton}
        />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
          multiline
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSend}
          disabled={loading || (!input.trim() && !selectedImage)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    maxWidth: "80%",
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "white",
  },
  assistantMessageText: {
    color: "#333",
  },
  messageImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
    backgroundColor: "transparent",
  },
  imageButton: {
    margin: 0,
  },
  selectedImageContainer: {
    padding: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 0,
  },
  loading: {
    marginVertical: 8,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    color: "rgba(0, 0, 0, 0.5)",
  },
});
