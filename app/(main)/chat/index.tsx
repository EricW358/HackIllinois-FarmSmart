import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
  Clipboard,
} from "react-native";
import {
  useTheme,
  TextInput,
  Surface,
  IconButton,
  Avatar,
  Snackbar,
} from "react-native-paper";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useChat } from "../../../hooks/useChat";
import { LinearGradient } from "expo-linear-gradient";
import { FarmAnalyticsCharts } from "../../../components/FarmAnalyticsCharts";
import Markdown from "react-native-markdown-display";

// Exact colors from the Tailwind CSS variables
const COLORS = {
  background: "#030106", // HSL: 260, 50%, 1% (extremely dark purple-black)
  foreground: "#F1F5FB", // --foreground: 210 40% 98%
  primary: "#A855F7", // --primary: 270 100% 70%
  primaryForeground: "#F1F5FB", // --primary-foreground: 210 40% 98%
  secondary: "#D946EF", // --secondary: 290 100% 70%
  secondaryForeground: "#F1F5FB", // --secondary-foreground: 210 40% 98%
  muted: "#1E1433", // --muted: 260 50% 15%
  mutedForeground: "#A1B4CC", // --muted-foreground: 215 20% 65%
  border: "#1E1433", // --border: 260 50% 15%

  // Neon gradient colors
  purple: "#A855F7", // purple-500
  pink: "#EC4899", // pink-500
  blue: "#3B82F6", // blue-500
  neonGreen: "#39FF14", // neon green for bold text
};

// Animation for the input glow effect
const useInputGlowAnimation = () => {
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 0.5,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.3,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => {
      glowOpacity.stopAnimation();
    };
  }, []);

  return glowOpacity;
};

export default function ChatScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [loadingState, setLoadingState] = useState({
    message: "Thinking",
    startTime: Date.now(),
  });
  const {
    conversation,
    loading,
    error,
    handleSendMessage,
    createConversation,
    isCollectingFarmInfo,
  } = useChat();
  const scrollViewRef = useRef<ScrollView>(null);
  const glowOpacity = useInputGlowAnimation();

  // Update loading message every few seconds
  useEffect(() => {
    if (loading) {
      // Reset loading state when loading starts
      setLoadingState({
        message: "Thinking",
        startTime: Date.now(),
      });

      const loadingMessages = [
        "Thinking",
        "Analyzing",
        "Curating",
        "Plotting",
        "Finalizing",
      ];

      const interval = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - loadingState.startTime) / 1000
        );
        const messageIndex = Math.min(
          Math.floor(elapsedSeconds / 3), // Change message every 3 seconds
          loadingMessages.length - 1
        );

        setLoadingState((prevState) => ({
          message: loadingMessages[messageIndex],
          startTime: prevState.startTime, // Keep the original start time
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Function to show toast message
  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  // Function to hide toast message
  const hideToast = () => {
    setToast({ visible: false, message: "" });
  };

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
    if (!date || isNaN(date.getTime())) {
      return "Just now"; // Fallback for invalid dates
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === "user";
    const nextMessage = conversation.messages[index + 1];
    const showTimestamp = !nextMessage || nextMessage.role !== message.role;

    // Handle long messages by truncating if needed
    const messageContent = message.content || "";

    // Format specialized responses with markdown
    const formattedContent =
      !isUser &&
      messageContent &&
      !messageContent.includes("```") &&
      !messageContent.includes("#") &&
      !messageContent.includes("**")
        ? formatSpecializedResponse(messageContent)
        : messageContent;

    return (
      <View
        key={index}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageContainer,
            isUser
              ? styles.userMessageContainer
              : styles.assistantMessageContainer,
          ]}
        >
          {!isUser ? (
            <LinearGradient
              colors={[COLORS.purple, COLORS.pink, COLORS.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>FS</Text>
            </LinearGradient>
          ) : null}

          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <View style={styles.messageContent}>
              {message.image && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: message.image }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {isUser ? (
                <Text
                  style={[styles.messageText, styles.userMessageText]}
                  numberOfLines={0}
                >
                  {messageContent}
                </Text>
              ) : (
                <View style={styles.markdownContainer}>
                  <Markdown
                    style={markdownStyles}
                    rules={{
                      code_block: (node, children, parent, styles) => {
                        // Extract language if specified
                        const nodeAny = node as any;
                        const language = nodeAny.sourceInfo
                          ? nodeAny.sourceInfo.split(/\s+/)[0]
                          : "text";

                        const handleCopy = () => {
                          Clipboard.setString(node.content);
                          showToast("Code copied to clipboard");
                        };

                        return (
                          <View key={node.key} style={styles.code_block}>
                            <View style={styles.codeHeader}>
                              <Text style={styles.codeHeaderText}>
                                {language}
                              </Text>
                              <Pressable
                                onPress={handleCopy}
                                style={styles.copyButton}
                              >
                                <Text style={styles.copyButtonText}>Copy</Text>
                              </Pressable>
                            </View>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              style={styles.codeScrollContainer}
                            >
                              <Text style={styles.code_block_text}>
                                {node.content}
                              </Text>
                            </ScrollView>
                          </View>
                        );
                      },
                      fence: (node, children, parent, styles) => {
                        // Extract language if specified
                        const nodeAny = node as any;
                        const language = nodeAny.sourceInfo
                          ? nodeAny.sourceInfo.split(/\s+/)[0]
                          : "text";

                        const handleCopy = () => {
                          Clipboard.setString(node.content);
                          showToast("Code copied to clipboard");
                        };

                        return (
                          <View key={node.key} style={styles.fence}>
                            <View style={styles.codeHeader}>
                              <Text style={styles.codeHeaderText}>
                                {language}
                              </Text>
                              <Pressable
                                onPress={handleCopy}
                                style={styles.copyButton}
                              >
                                <Text style={styles.copyButtonText}>Copy</Text>
                              </Pressable>
                            </View>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              style={styles.codeScrollContainer}
                            >
                              <Text style={styles.code_block_text}>
                                {node.content}
                              </Text>
                            </ScrollView>
                          </View>
                        );
                      },
                      heading1: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.heading1}>
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "bold",
                                color: COLORS.foreground,
                              }}
                            >
                              {children}
                            </Text>
                          </View>
                        );
                      },
                      heading2: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.heading2}>
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: COLORS.foreground,
                              }}
                            >
                              {children}
                            </Text>
                          </View>
                        );
                      },
                      heading3: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.heading3}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: COLORS.foreground,
                              }}
                            >
                              {children}
                            </Text>
                          </View>
                        );
                      },
                      strong: (node, children, parent, styles) => {
                        return (
                          <Text
                            key={node.key}
                            style={{
                              fontWeight: "bold",
                              color: COLORS.neonGreen,
                            }}
                          >
                            {children}
                          </Text>
                        );
                      },
                      bullet_list_item: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.list_item}>
                            <Text style={styles.list_item_bullet}>• </Text>
                            <View style={{ flex: 1 }}>{children}</View>
                          </View>
                        );
                      },
                      ordered_list_item: (
                        node,
                        children,
                        parent,
                        styles,
                        index
                      ) => {
                        return (
                          <View key={node.key} style={styles.list_item}>
                            <Text style={styles.list_item_number}>
                              {index + 1}.{" "}
                            </Text>
                            <View style={{ flex: 1 }}>{children}</View>
                          </View>
                        );
                      },
                      blockquote: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.blockquote}>
                            <View style={styles.blockquoteBar} />
                            <View style={styles.blockquoteContent}>
                              {children}
                            </View>
                          </View>
                        );
                      },
                      link: (node, children, parent, styles) => {
                        return (
                          <Text
                            key={node.key}
                            style={styles.link}
                            onPress={() => {
                              // Handle link press if needed
                              if (node.attributes && node.attributes.href) {
                                console.log(
                                  `Link pressed: ${node.attributes.href}`
                                );
                                // You could add logic to open the URL
                              }
                            }}
                          >
                            {children}
                          </Text>
                        );
                      },
                      table: (node, children, parent, styles) => {
                        return (
                          <View key={node.key} style={styles.table}>
                            {children}
                          </View>
                        );
                      },
                    }}
                  >
                    {formattedContent}
                  </Markdown>
                </View>
              )}

              {/* Render analytics charts if available */}
              {!isUser && message.analyticsData && (
                <View style={styles.analyticsContainer}>
                  <Text style={styles.analyticsTitle}>Farm Analytics</Text>
                  <View style={styles.analyticsContent}>
                    <FarmAnalyticsCharts data={message.analyticsData} />
                  </View>
                </View>
              )}

              {showTimestamp && (
                <Text
                  style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.assistantTimestamp,
                  ]}
                >
                  {formatTime(new Date(message.timestamp))}
                </Text>
              )}
            </View>
          </View>

          {isUser ? (
            <View style={styles.userAvatar}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>You</Text>
              </LinearGradient>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  // Helper function to format specialized responses with markdown
  const formatSpecializedResponse = (content: string) => {
    // Skip formatting if content already contains markdown formatting
    if (
      content.includes("##") ||
      content.includes("###") ||
      content.includes("**")
    ) {
      return content;
    }

    // Check if it's a specialized response with profits and explanations
    if (content.includes("Profits:") && content.includes("Explanations:")) {
      // Check if this is a duplicate of an already formatted response
      // This can happen if the same message appears twice in the conversation
      const isDuplicate = conversation.messages.some(
        (msg) =>
          msg.content &&
          msg.content.includes("## Profits:") &&
          msg.content.includes("## Explanations:")
      );

      if (isDuplicate) {
        return content; // Return unformatted to avoid duplication
      }

      // Format the specialized response with markdown
      return content
        .replace(/Profits:/g, "## Profits:")
        .replace(/Explanations:/g, "## Explanations:")
        .replace(/External Tool:/g, "## External Tool:")
        .replace(/External Explanation:/g, "## External Explanation:")
        .replace(/(\w+_name):/g, "**$1**:")
        .replace(/(\w+): ([^,]+)/g, (match, p1, p2) => {
          // Make the property name bold with neon green color
          if (p1.includes("profit") || p1.includes("cost") || p1 === "best") {
            return `- **${p1}**: ${p2}`;
          }
          return `- **${p1}**: ${p2}`;
        });
    }

    // For welcome messages and other simple messages
    if (content.length < 200 && !content.includes("\n")) {
      return `### ${content}`;
    }

    return content;
  };

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
        {conversation.messages.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <LinearGradient
              colors={[COLORS.purple, COLORS.pink, COLORS.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeAvatar}
            >
              <Text style={styles.welcomeAvatarText}>FS</Text>
            </LinearGradient>

            <LinearGradient
              colors={[COLORS.purple, COLORS.pink, COLORS.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 8, marginBottom: 16 }}
            >
              <Text style={styles.welcomeTitle}>Welcome to FarmSmart</Text>
            </LinearGradient>

            <Text style={styles.emptyStateText}>
              Your AI farming assistant is here to help with crop management,
              weather insights, and agricultural best practices.
            </Text>
          </View>
        )}

        {conversation.messages.map(renderMessage)}

        {loading && (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={[COLORS.purple, COLORS.pink, COLORS.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>FS</Text>
            </LinearGradient>

            <View style={styles.loadingBubble}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.loading}
              />
              <Text style={styles.loadingText}>
                {loadingState.message}... (
                {Math.floor((Date.now() - loadingState.startTime) / 1000)}s)
              </Text>
            </View>
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
            iconColor={COLORS.pink}
          />
        </BlurView>
      )}

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <View style={styles.inputGlowContainer}>
            <Animated.View
              style={[styles.inputGlow, { opacity: glowOpacity }]}
            />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about crops, weather, or farming techniques..."
              placeholderTextColor={COLORS.mutedForeground}
              style={styles.input}
              multiline
              maxLength={1000}
              dense
            />
          </View>

          <IconButton
            icon="image-outline"
            size={20}
            onPress={pickImage}
            style={styles.imageButton}
            iconColor={COLORS.foreground}
          />

          <IconButton
            icon="send"
            size={20}
            onPress={handleSubmit}
            disabled={loading || (!input.trim() && !selectedImage)}
            style={[
              styles.sendButton,
              loading || (!input.trim() && !selectedImage)
                ? styles.sendButtonDisabled
                : null,
            ]}
            iconColor={
              loading || (!input.trim() && !selectedImage)
                ? COLORS.mutedForeground
                : COLORS.primaryForeground
            }
          />
        </View>
      </View>

      {/* Add Snackbar for toast messages */}
      <Snackbar
        visible={toast.visible}
        onDismiss={hideToast}
        duration={2000}
        style={styles.snackbar}
      >
        {toast.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background, // HSL: 260, 50%, 1%
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: 16,
      paddingBottom: 32,
      gap: 16,
      width: "100%",
    },
    messageRow: {
      marginVertical: 4,
      width: "100%",
      alignItems: "flex-start",
    },
    userMessageRow: {
      justifyContent: "flex-end",
      alignItems: "flex-end",
    },
    assistantMessageRow: {
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    messageContainer: {
      flexDirection: "row",
      maxWidth: "85%",
      gap: 12,
      flexShrink: 1,
    },
    userMessageContainer: {
      flexDirection: "row-reverse",
    },
    assistantMessageContainer: {
      flexDirection: "row",
    },
    messageBubble: {
      padding: 16,
      borderRadius: 12,
      maxWidth: "100%",
      flexShrink: 1,
      alignSelf: "flex-start",
      width: "100%",
    },
    userMessage: {
      backgroundColor: COLORS.primary,
    },
    assistantMessage: {
      backgroundColor: COLORS.muted,
      borderWidth: 1,
      borderColor: "transparent",
      shadowColor: COLORS.purple,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
      width: "100%",
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
      flexShrink: 1,
      flexWrap: "wrap",
    },
    userMessageText: {
      color: COLORS.primaryForeground,
    },
    assistantMessageText: {
      color: COLORS.foreground,
    },
    avatarGradient: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    userAvatar: {
      marginLeft: 8,
    },
    avatarText: {
      color: COLORS.foreground,
      fontWeight: "bold",
      fontSize: 14,
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
    inputWrapper: {
      borderTopWidth: 1,
      borderTopColor: `${COLORS.border}80`,
      padding: 16,
      backgroundColor: COLORS.background, // HSL: 260, 50%, 5%
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: 768,
      marginHorizontal: "auto",
      position: "relative",
      width: "100%",
    },
    inputGlowContainer: {
      flex: 1,
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
    },
    inputGlow: {
      position: "absolute",
      top: -20,
      left: -20,
      right: -20,
      bottom: -20,
      backgroundColor: COLORS.purple,
      borderRadius: 20,
      opacity: 0.3,
      zIndex: -1,
      transform: [{ scale: 1.2 }],
    },
    input: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: COLORS.foreground,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingRight: 80,
      fontSize: 16,
      borderWidth: 0,
    },
    inputButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    imageButton: {
      position: "absolute",
      right: 48,
      margin: 0,
      backgroundColor: "transparent",
    },
    sendButton: {
      position: "absolute",
      right: 0,
      margin: 0,
      backgroundColor: COLORS.primary,
      borderRadius: 8,
    },
    sendButtonDisabled: {
      backgroundColor: "transparent",
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
      backgroundColor: COLORS.background, // HSL: 260, 50%, 5%
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      maxWidth: "80%",
    },
    loadingBubble: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.muted,
      padding: 12,
      borderRadius: 12,
      shadowColor: COLORS.purple,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: "transparent",
    },
    loading: {
      marginRight: 8,
    },
    loadingText: {
      fontSize: 14,
      color: COLORS.mutedForeground,
    },
    errorContainer: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: "#991B1B",
    },
    error: {
      textAlign: "center",
      color: COLORS.foreground,
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
      color: COLORS.mutedForeground,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      minHeight: 300,
    },
    welcomeAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    welcomeAvatarText: {
      color: COLORS.foreground,
      fontWeight: "bold",
      fontSize: 24,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 8,
      color: "transparent",
      textAlign: "center",
      paddingHorizontal: 16,
      paddingVertical: 4,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    emptyStateText: {
      textAlign: "center",
      fontSize: 16,
      lineHeight: 24,
      color: COLORS.foreground,
      maxWidth: 300,
    },
    messageContent: {
      gap: 8,
      flexShrink: 1,
      width: "100%",
    },
    analyticsContainer: {
      marginTop: 16,
      width: "100%",
      maxWidth: "100%",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.primary + "40",
      backgroundColor: COLORS.background + "80",
      overflow: "hidden" as const,
      alignItems: "center",
      paddingBottom: 4,
    },
    analyticsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.foreground,
      textAlign: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: `${COLORS.border}80`,
      width: "100%",
    },
    analyticsContent: {
      width: "100%",
      padding: 0,
    },
    markdownContainer: {
      width: "100%",
      paddingVertical: 4,
    },
    code_block: {
      backgroundColor: `${COLORS.muted}80`,
      borderRadius: 8,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      width: "100%" as const,
      overflow: "hidden" as const,
    },
    code_block_text: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
      color: COLORS.foreground,
      padding: 12,
    },
    codeHeader: {
      backgroundColor: `${COLORS.muted}`,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    codeHeaderText: {
      color: COLORS.foreground,
      fontSize: 12,
      fontWeight: "bold" as const,
    },
    copyButton: {
      backgroundColor: `${COLORS.primary}40`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    copyButtonText: {
      color: COLORS.foreground,
      fontSize: 10,
      fontWeight: "bold" as const,
    },
    codeScrollContainer: {
      maxWidth: "100%",
    },
    fence: {
      backgroundColor: `${COLORS.muted}80`,
      borderRadius: 8,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      width: "100%" as const,
      overflow: "hidden" as const,
    },
    list_item: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      marginBottom: 8,
      paddingLeft: 4,
    },
    list_item_bullet: {
      fontSize: 16,
      lineHeight: 24,
      marginRight: 8,
      color: COLORS.primary,
    },
    list_item_number: {
      fontSize: 16,
      lineHeight: 24,
      marginRight: 8,
      color: COLORS.primary,
    },
    blockquote: {
      flexDirection: "row" as const,
      marginVertical: 8,
      backgroundColor: `${COLORS.muted}40`,
      borderRadius: 8,
      overflow: "hidden" as const,
    },
    blockquoteBar: {
      width: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 0,
      marginRight: 0,
    },
    blockquoteContent: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    snackbar: {
      backgroundColor: COLORS.muted,
      color: COLORS.foreground,
      borderRadius: 8,
    },
  });

// Update the markdown styles
const markdownStyles = {
  body: {
    color: COLORS.foreground,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: COLORS.foreground,
    marginTop: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: COLORS.foreground,
    marginTop: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: COLORS.foreground,
    marginTop: 12,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: COLORS.foreground,
    marginTop: 10,
    marginBottom: 6,
  },
  heading5: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: COLORS.foreground,
    marginTop: 8,
    marginBottom: 4,
  },
  heading6: {
    fontSize: 14,
    fontWeight: "bold" as const,
    fontStyle: "italic" as const,
    color: COLORS.foreground,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 6,
    marginBottom: 10,
    flexWrap: "wrap" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    flexDirection: "row" as const,
    marginVertical: 8,
    backgroundColor: `${COLORS.muted}40`,
    borderRadius: 8,
    overflow: "hidden" as const,
  },
  code_inline: {
    backgroundColor: `${COLORS.muted}80`,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
    color: COLORS.primary,
  },
  bullet_list: {
    marginLeft: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  ordered_list: {
    marginLeft: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    overflow: "hidden" as const,
  },
  tr: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  th: {
    padding: 10,
    fontWeight: "bold" as const,
    backgroundColor: `${COLORS.muted}80`,
  },
  td: {
    padding: 10,
  },
  em: {
    fontStyle: "italic" as const,
  },
  strong: {
    fontWeight: "bold" as const,
    color: COLORS.neonGreen,
  },
  image: {
    borderRadius: 8,
    marginVertical: 10,
    maxWidth: "100%" as const,
  },
  list_item_bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    color: COLORS.primary,
  },
  list_item_number: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    color: COLORS.primary,
  },
};
