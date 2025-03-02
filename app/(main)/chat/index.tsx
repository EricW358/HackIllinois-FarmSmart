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
import Markdown from "react-native-markdown-display";

const { width } = Dimensions.get("window");

const FormattedText = ({ content, style }: { content: string; style: any }) => {
  const theme = useTheme();
  const textStyles = useMemo(() => createStyles(theme), [theme]);

  // Convert the content to proper markdown
  const markdownContent = content
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return "";

      // Format headings (lines ending with :)
      if (trimmedLine.endsWith(":")) {
        return `### ${trimmedLine}`;
      }

      // Format lists (lines starting with - or *)
      if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
        return trimmedLine;
      }

      // Format numbers and dollar amounts
      return trimmedLine.replace(
        /\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?/g,
        (match) => `**${match}**`
      );
    })
    .filter((line) => line)
    .join("\n\n");

  return (
    <Markdown
      style={{
        body: style,
        heading3: textStyles.heading,
        paragraph: textStyles.paragraph,
        bullet_list: textStyles.bulletList,
        ordered_list: textStyles.orderedList,
        code_block: textStyles.codeBlock,
        code_inline: textStyles.codeText,
        strong: textStyles.boldText,
      }}
    >
      {markdownContent}
    </Markdown>
  );
};

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
      <FormattedText
        content={formatMessageContent(message.content)}
        style={[
          styles.messageText,
          message.role === "user"
            ? styles.userMessageText
            : styles.assistantMessageText,
        ]}
      />
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

  const formatMessageContent = (content: string) => {
    // Split content into sections based on code blocks
    const sections = content.split(/(```[\s\S]*?```)/g);

    return sections
      .map((section) => {
        // Handle code blocks
        if (section.startsWith("```") && section.endsWith("```")) {
          return section; // Keep markdown code blocks as is
        }

        // Format regular text sections
        const lines = section.split("\n").map((line) => {
          const trimmedLine = line.trim();

          // Skip empty lines
          if (!trimmedLine) return "";

          // Format headings (lines ending with :)
          if (trimmedLine.endsWith(":")) {
            return `### ${trimmedLine.slice(0, -1)}`;
          }

          // Format lists (lines starting with - or *)
          if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
            return trimmedLine;
          }

          // Format numbers and dollar amounts
          return trimmedLine.replace(
            /\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?/g,
            (match) => `**${match}**`
          );
        });

        // Join lines with proper spacing
        return lines.filter((line) => line).join("\n\n");
      })
      .filter((section) => section) // Remove empty sections
      .join("\n\n"); // Add proper spacing between sections
  };

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
      marginVertical: 8,
      maxWidth: "85%",
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.primary,
      marginLeft: "15%",
    },
    assistantMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: "15%",
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
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
    messageContent: {
      gap: 8,
    },
    paragraph: {
      marginVertical: 4,
    },
    heading: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.onSurface,
      marginTop: 16,
      marginBottom: 8,
    },
    bulletPoint: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingLeft: 4,
      marginVertical: 2,
    },
    bullet: {
      marginRight: 8,
      fontSize: 16,
      lineHeight: 24,
    },
    bulletText: {
      flex: 1,
    },
    codeBlock: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      marginVertical: 8,
      borderRadius: 8,
    },
    codeText: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    boldText: {
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    bulletList: {
      marginVertical: 8,
    },
    orderedList: {
      marginVertical: 8,
    },
  });
