import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuth";
import OpenAI from "openai";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
}

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
  is_archived: boolean;
};

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useChat(conversationId?: string) {
  const [conversation, setConversation] = useState<Conversation>({
    id: "",
    title: "",
    messages: [],
    created_at: new Date(),
    updated_at: new Date(),
    is_archived: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setConversation({
          ...data,
          messages: data.messages || [],
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string = "New Conversation") => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: user?.id,
            title,
            messages: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setConversation({
          ...data,
          messages: [],
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        });
        return data.id;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (content: string, image?: string) => {
      try {
        setLoading(true);
        setError(null);

        console.log("Sending message with content:", content);
        if (image) {
          console.log("Image URL format:", image.substring(0, 50) + "...");
        }

        // Add user message to conversation
        const userMessage: Message = {
          role: "user",
          content,
          image,
          timestamp: new Date(),
        };

        const updatedMessages = [...conversation.messages, userMessage];
        setConversation((prev) => ({
          ...prev,
          messages: updatedMessages,
        }));

        // Prepare messages for OpenAI
        const apiMessages = updatedMessages.map((msg) => {
          if (msg.image) {
            return {
              role: msg.role,
              content: [
                {
                  type: "text",
                  text: msg.content,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: msg.image,
                    detail: "high",
                  },
                },
              ],
            };
          }
          return {
            role: msg.role,
            content: msg.content,
          };
        });

        // Add system message and current message
        const finalMessages = [
          {
            role: "system",
            content:
              "You are a knowledgeable farming assistant with expertise in plant and crop analysis. When provided with images, analyze them carefully and provide detailed insights about plant health, potential issues, and recommendations. Help users with questions about agriculture, crop management, soil health, and sustainable farming practices. Provide practical, actionable advice based on scientific principles.",
          },
          ...apiMessages,
        ];

        console.log("API Request configuration:", {
          model: image ? "gpt-4o" : "gpt-4o-mini",
          messageCount: finalMessages.length,
          hasImage: !!image,
          apiKeyPrefix:
            process.env.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0, 10) + "...",
        });

        // Get response from OpenAI
        const completion = await openai.chat.completions.create({
          model: image ? "gpt-4o" : "gpt-4o-mini",
          messages: finalMessages as any,
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 1,
          stream: false,
          n: 1,
        });

        console.log("OpenAI Response:", {
          status: "success",
          messageContent:
            completion.choices[0].message?.content?.substring(0, 50) + "...",
        });

        const assistantMessage: Message = {
          role: "assistant",
          content:
            completion.choices[0].message?.content ||
            "Sorry, I could not generate a response.",
          timestamp: new Date(),
        };

        // Add assistant message to conversation
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        // Store conversation in Supabase (optional, implement later)
        // await storeConversation(userMessage, assistantMessage);
      } catch (err) {
        console.error("Error details:", err);
        if (err instanceof Error) {
          console.error("Error name:", err.name);
          console.error("Error message:", err.message);
          if ("status" in err) {
            console.error("Error status:", (err as any).status);
          }
          console.error("Error stack:", err.stack);
        }
        setError(
          err instanceof Error
            ? `Error: ${err.message}`
            : "An error occurred while processing your message"
        );
      } finally {
        setLoading(false);
      }
    },
    [conversation]
  );

  return {
    conversation,
    loading,
    error,
    sendMessage,
    createConversation,
  };
}
