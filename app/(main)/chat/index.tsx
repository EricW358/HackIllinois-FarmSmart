import React, { useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Surface,
  ActivityIndicator,
  useTheme,
  MD3Theme,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useChat } from "../../../hooks/useChat";
import { BlurView } from "expo-blur";
import { FarmAnalyticsCharts } from "../../../components/FarmAnalyticsCharts";

const { width } = Dimensions.get("window");

export default function ChatScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    conversation,
    loading,
    error,
    handleSendMessage,
    createConversation,
    isCollectingFarmInfo,
  } = useChat();
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

  const handleSubmit = async () => {
    if (input.trim() || selectedImage) {
      const messageText = input.trim();
      const messageImage = selectedImage;
      setInput("");
      setSelectedImage(null);
      scrollViewRef.current?.scrollToEnd({ animated: true });
      await handleSendMessage(messageText, messageImage || undefined);
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
      key={`${message.content}-${message.timestamp.getTime()}`}
      style={[
        styles.messageBubble,
        message.role === "user" ? styles.userMessage : styles.assistantMessage,
        { elevation: 2 },
      ]}
    >
      {message.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: message.image }} style={styles.messageImage} />
        </View>
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
      {message.analyticsData && (
        <FarmAnalyticsCharts data={message.analyticsData} />
      )}
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {conversation.messages.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Welcome to FarmSmart! Ask me anything about farming, crop
              management, or upload an image for plant analysis.
            </Text>
          </View>
        )}
        {conversation.messages.map(renderMessage)}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.loading}
            />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
        {error && (
          <Surface style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </Surface>
        )}
      </ScrollView>

      {selectedImage && (
        <BlurView intensity={100} style={styles.selectedImageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <IconButton
            icon="close-circle"
            size={24}
            onPress={() => setSelectedImage(null)}
            style={styles.removeImageButton}
          />
        </BlurView>
      )}

      <Surface style={styles.inputSurface} elevation={4}>
        <View style={styles.inputContainer}>
          <IconButton
            icon="camera"
            size={24}
            onPress={pickImage}
            style={styles.imageButton}
            iconColor={theme.colors.primary}
          />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message FarmSmart..."
            style={styles.input}
            multiline
            maxLength={1000}
            dense
          />
          <IconButton
            icon="send"
            size={24}
            onPress={handleSubmit}
            disabled={loading || (!input.trim() && !selectedImage)}
            iconColor={
              loading || (!input.trim() && !selectedImage)
                ? theme.colors.outline
                : theme.colors.primary
            }
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: 16,
      paddingBottom: 32,
    },
    messageBubble: {
      padding: 16,
      marginVertical: 4,
      maxWidth: "85%",
      borderRadius: 20,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.primary,
    },
    assistantMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceVariant,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
    },
    userMessageText: {
      color: theme.colors.onPrimary,
    },
    assistantMessageText: {
      color: theme.colors.onSurfaceVariant,
    },
    imageContainer: {
      marginBottom: 12,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
    },
    messageImage: {
      width: "100%",
      height: 200,
      borderRadius: 12,
    },
    inputSurface: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.05)",
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 24,
      elevation: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      marginHorizontal: 8,
      maxHeight: 120,
      backgroundColor: "transparent",
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    imageButton: {
      margin: 0,
    },
    selectedImageContainer: {
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.05)",
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
    },
    selectedImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    removeImageButton: {
      position: "absolute",
      top: -8,
      right: -8,
      margin: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    loading: {
      marginRight: 8,
    },
    loadingText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    errorContainer: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 12,
    },
    error: {
      color: theme.colors.onErrorContainer,
      textAlign: "center",
    },
    timestamp: {
      fontSize: 11,
      marginTop: 6,
      alignSelf: "flex-end",
    },
    userTimestamp: {
      color: "rgba(255, 255, 255, 0.7)",
    },
    assistantTimestamp: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      opacity: 0.7,
    },
    emptyStateText: {
      textAlign: "center",
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 24,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    padding: 16,
    marginVertical: 4,
    maxWidth: "85%",
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  assistantMessageText: {
    color: "#000000",
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  inputSurface: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 120,
    backgroundColor: "transparent",
    fontSize: 16,
  },
  imageButton: {
    margin: 0,
  },
  selectedImageContainer: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    margin: 0,
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loading: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  error: {
    textAlign: "center",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    opacity: 0.7,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    opacity: 0.7,
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
