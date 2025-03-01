import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuth";
import OpenAI from "openai";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
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
    messages: [],
  } as Conversation);
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
    async (content: string) => {
      try {
        setLoading(true);
        setError(null);

        // Add user message to conversation
        const userMessage: Message = {
          role: "user",
          content,
          timestamp: new Date(),
        };

        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
        }));

        // Prepare conversation history for OpenAI
        const messages = [
          {
            role: "system",
            content:
              "You are a knowledgeable farming assistant. Help users with questions about agriculture, crop management, soil health, and sustainable farming practices. Provide practical, actionable advice based on scientific principles.",
          },
          ...conversation.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content },
        ];

        // Get response from OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
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
        console.error("Error in chat:", err);
        setError(
          err instanceof Error
            ? err.message
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
