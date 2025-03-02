import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuth";
import OpenAI from "openai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PREDEFINED_FARMS } from "../data/farms";
import { FarmAnalyticsData } from "../components/FarmAnalyticsCharts";

export interface FarmInfo {
  location: string;
  budget: string;
  farmName: string;
  toolsAvailable: string;
  fertilizersAvailable: string;
  pesticidesAvailable: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
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
  farmInfo?: FarmInfo;
};

const FARM_INFO_QUESTIONS = [
  {
    key: "farmName",
    question:
      "Please select your farm:\n1. Illinois State Farm\n2. North Dakota State Farm\n3. Other\n\nPlease enter 1, 2, or 3.",
  },
  {
    key: "location",
    question:
      "To provide better assistance, could you tell me your location (city/region)? Type N/A if you prefer not to share.",
  },
  {
    key: "budget",
    question:
      "What is your budget for farming equipment and tools? This helps me recommend solutions within your price range.",
  },
  {
    key: "toolsAvailable",
    question:
      "What farming tools do you have available? Please list them or type N/A.",
  },
  {
    key: "fertilizersAvailable",
    question:
      "What fertilizers do you currently use or have access to? Type N/A if none.",
  },
  {
    key: "pesticidesAvailable",
    question:
      "What pesticides do you currently use or have access to? Type N/A if none.",
  },
];

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const getFarmData = (farmName: string) => {
  return PREDEFINED_FARMS[farmName as keyof typeof PREDEFINED_FARMS];
};

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
  const [isCollectingFarmInfo, setIsCollectingFarmInfo] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [farmInfo, setFarmInfo] = useState<Partial<FarmInfo>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      checkFarmInfo();
    }
  }, [conversationId]);

  const checkFarmInfo = async () => {
    try {
      const storedFarmInfo = await AsyncStorage.getItem(`farmInfo:${user?.id}`);
      if (!storedFarmInfo) {
        setIsCollectingFarmInfo(true);
        setCurrentQuestionIndex(0);
        // Add initial welcome message
        const welcomeMessage: Message = {
          role: "assistant",
          content:
            "Welcome! Before we begin, I'd like to collect some information about your farm to provide better assistance. " +
            FARM_INFO_QUESTIONS[0].question,
          timestamp: new Date(),
        };
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, welcomeMessage],
        }));
      } else {
        setFarmInfo(JSON.parse(storedFarmInfo));
      }
    } catch (err) {
      console.error("Error checking farm info:", err);
    }
  };

  const saveFarmInfo = async (info: FarmInfo) => {
    try {
      await AsyncStorage.setItem(`farmInfo:${user?.id}`, JSON.stringify(info));
      setFarmInfo(info);
    } catch (err) {
      console.error("Error saving farm info:", err);
    }
  };

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

  const parseAnalyticsData = (content: string): FarmAnalyticsData | null => {
    try {
      // Extract profits section
      const profitsMatch = content.match(/Profits: (.*?)(?=\n|$)/);
      if (!profitsMatch) return null;

      // Parse profits section
      const profitsStr = profitsMatch[1];
      const profitPairs = profitsStr
        .split(",")
        .map((pair) => {
          const [nameStr, profitStr] = pair.split(":").map((s) => s.trim());
          // Extract numbers more reliably using regex
          const profitMatch = profitStr.match(
            /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/
          );
          const profit = profitMatch
            ? parseFloat(profitMatch[1].replace(/,/g, ""))
            : 0;

          return {
            name: nameStr.replace(/"/g, "").trim(), // Remove any quotes and trim
            profit: isNaN(profit) ? 0 : profit, // Ensure we have a valid number
          };
        })
        .filter((pair) => pair.name && pair.profit > 0); // Filter out invalid entries

      if (profitPairs.length === 0) return null;

      // Extract external tool section
      const externalToolMatch = content.match(/External Tool: (.*?)(?=\n|$)/);
      if (!externalToolMatch) return null;

      // Parse external tool data more carefully
      const externalToolStr = externalToolMatch[1];
      const costMatch =
        externalToolStr.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g) || [];
      const numbers = costMatch
        .map((str) => parseFloat(str.replace(/[$,]/g, "")))
        .filter((num) => !isNaN(num) && num > 0);

      const [toolCost, predictedProfit, weeklyProfitRate] = numbers;

      // Calculate projected profits based on weekly profit rate
      const baseProfit = Math.max(...profitPairs.map((p) => p.profit));
      const weeklyRate = weeklyProfitRate || baseProfit * 0.1; // Use 10% of base profit if no rate provided

      const projectedProfits = Array(6)
        .fill(0)
        .map((_, i) => {
          return Math.round(baseProfit + weeklyRate * (i + 1));
        });

      // Return formatted analytics data
      return {
        tillageNames: profitPairs.map((p) => p.name),
        profits: profitPairs.map((p) => Math.round(p.profit)),
        revenue: profitPairs.map((p) => Math.round(p.profit * 1.5)), // Estimate revenue as 150% of profit
        projectedProfits: projectedProfits,
        breakEvenPoint: Math.round(toolCost || Math.max(...projectedProfits)),
      };
    } catch (error) {
      console.error("Error parsing analytics data:", error);
      return null;
    }
  };

  const generateChartData = async (
    analysisResponse: string
  ): Promise<FarmAnalyticsData | null> => {
    try {
      const systemMessage = `You are a data processing assistant. Based on the farming analysis below, generate ONLY numerical data for charts in exactly this format:
{
  "tillageNames": ["name1", "name2", ...],
  "profits": [profit1, profit2, ...],
  "revenue": [revenue1, revenue2, ...],
  "projectedProfits": [month1, month2, month3, month4, month5, month6],
  "breakEvenPoint": number
}
Use the exact tool names from the analysis, real profit numbers mentioned, and calculate revenue as 150% of profits. 

IMPORTANT REQUIREMENTS:
1. For projected profits, ensure that the values show a growth trend where the final months ALWAYS exceed the break-even point. If the initial projected values are too low, increase the growth rate to ensure the final value is at least 20% higher than the break-even point.
2. ALL profit and revenue values MUST be POSITIVE numbers greater than zero. Never include negative or zero values.
3. Revenue should always be higher than profit (typically 150% of profit).

ONLY RESPOND WITH THE JSON DATA, NO OTHER TEXT.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: analysisResponse },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const jsonStr = completion.choices[0].message?.content || "";
      console.log("Generated chart data:", jsonStr); // Add logging for debugging

      try {
        const data = JSON.parse(jsonStr);
        // Validate the data structure
        if (
          !data.tillageNames ||
          !data.profits ||
          !data.revenue ||
          !data.projectedProfits ||
          !data.breakEvenPoint
        ) {
          console.error("Invalid data structure:", data);
          return null;
        }

        // Ensure all arrays have values and numbers are valid
        if (
          data.tillageNames.length === 0 ||
          data.profits.some(isNaN) ||
          data.revenue.some(isNaN) ||
          data.projectedProfits.some(isNaN) ||
          isNaN(data.breakEvenPoint)
        ) {
          console.error("Invalid data values:", data);
          return null;
        }

        // Ensure all profits and revenue are positive
        const minProfitValue = 50; // Minimum profit value
        data.profits = data.profits.map((profit: number) =>
          Math.max(Number(profit), minProfitValue)
        );
        data.revenue = data.profits.map((profit: number) =>
          Math.max(profit * 1.5, profit + 100)
        ); // Ensure revenue > profit

        // Ensure projected profits eventually exceed break-even point
        const breakEvenPoint = Math.max(Number(data.breakEvenPoint), 500); // Ensure break-even is reasonable
        const projectedProfits = data.projectedProfits.map(Number);

        // If the last projected profit doesn't exceed break-even point by at least 20%
        if (
          projectedProfits[projectedProfits.length - 1] <
          breakEvenPoint * 1.2
        ) {
          // Calculate a growth rate that ensures the final value exceeds break-even by 20%
          const startValue = Math.max(
            projectedProfits[0],
            breakEvenPoint * 0.5,
            minProfitValue
          );
          const targetEndValue = breakEvenPoint * 1.2;
          const months = projectedProfits.length;

          // Create a new array with increasing values that reach the target
          const newProjectedProfits = Array(months)
            .fill(0)
            .map((_, index) => {
              const growthFactor = index / (months - 1);
              return Math.round(
                startValue + (targetEndValue - startValue) * growthFactor
              );
            });

          data.projectedProfits = newProjectedProfits;
        } else {
          // Ensure all projected profits are positive
          data.projectedProfits = projectedProfits.map((profit: number) =>
            Math.max(profit, minProfitValue)
          );
        }

        return {
          tillageNames: data.tillageNames,
          profits: data.profits,
          revenue: data.revenue,
          projectedProfits: data.projectedProfits,
          breakEvenPoint: breakEvenPoint,
        };
      } catch (parseError) {
        console.error("Error parsing chart data JSON:", parseError);
        return null;
      }
    } catch (error) {
      console.error("Error generating chart data:", error);
      return null;
    }
  };

  const handleFarmInfoResponse = async (content: string) => {
    const currentQuestion = FARM_INFO_QUESTIONS[currentQuestionIndex];

    // Handle farm selection for the first question
    if (currentQuestionIndex === 0) {
      const selection = content.trim();
      let farmName = "";

      if (selection === "1") {
        farmName = "Illinois State Farm";
      } else if (selection === "2") {
        farmName = "North Dakota State Farm";
      } else if (selection === "3") {
        // For "Other" selection, continue with remaining questions
        const updatedFarmInfo = {
          ...farmInfo,
          [currentQuestion.key]: "Other Farm",
        };
        setFarmInfo(updatedFarmInfo);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        return {
          role: "assistant" as const,
          content: "Thank you! " + FARM_INFO_QUESTIONS[1].question,
          timestamp: new Date(),
        };
      } else {
        // Invalid selection
        return {
          role: "assistant" as const,
          content:
            "Please enter a valid selection (1, 2, or 3).\n\n" +
            FARM_INFO_QUESTIONS[0].question,
          timestamp: new Date(),
        };
      }

      // Handle predefined farm selection
      if (farmName) {
        const farmData = getFarmData(farmName);
        if (farmData) {
          const updatedFarmInfo = {
            farmName,
            location: farmData.location,
            budget: "N/A", // Default value for predefined farms
            toolsAvailable: JSON.stringify(farmData.tillageOptions),
            fertilizersAvailable: "N/A",
            pesticidesAvailable: "N/A",
          };
          await saveFarmInfo(updatedFarmInfo as FarmInfo);
          setIsCollectingFarmInfo(false);

          // Prepare the specialized first response for predefined farm
          const systemMessage = `You are an advanced agricultural AI assistant. Your goal is to evaluate each tillage tool from the provided JSON list and estimate the profit for using that tool under the given farm conditions. For each tool, you should provide:
 - An estimated profit value (in $ per acre) based on its operating costs and assumed yield improvements,
 - A brief explanation of how you arrived at that profit estimate.
 - Consider the user's budget when recommending tools and solutions.

After processing all tools, output the results in the following exact format:

Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...
Explanations: tool1_name: explanation, tool2_name: explanation, ...
External Tool: (Recommend one third-party external tool with its price that would enhance efficiency, considering the user's budget if specified.)`;

          const userMessage = `My location is ${farmData.location}. 
My budget is ${updatedFarmInfo.budget}.
My tools are ${JSON.stringify(farmData.tillageOptions, null, 2)}. 
The description of your soil is ${farmData.soilDescription}

Given this scenario, please evaluate each tool from the provided JSON list and estimate the profit (in $ per acre) for using that tool. Be sure to factor in everything provided, including the location, toolstack, budget, as well as the soil data provided. 

For each tool, provide a brief explanation of your profit estimate. In your explanations, ensure that you have indicated which tool is best. The best tool constitutes as that with the highest predicted profit margin.

For the external tool, recommend a third-party external tool with its price that would enhance efficiency. Consider my budget when making recommendations. If the tool exceeds my budget, explain the long-term benefits that might justify the investment. Provide the cost of the tool, the predicted profits, and the weekly profit for that tool. We need the weekly profit to see how long it would take to break even on the external product. 

Next, provide an explanation, similar to your explanation above, on why you picked this tool. Ensure that your answer accounts for the soil data and your explanations give explanations in relation to the soil data that was provided. Be sure to name-drop specific descriptions of the soils that were provided in your explanations. 

Then, output all the results in the following format:

Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...
Explanations: tool1_name: explanation, tool2_name: explanation, ...
External Tool: tool_name: tool_cost, predicted_profit, weekly_profit_rate
External Explanation: Why the tool is efficient for the situation we are in.`;

          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
              ],
              max_tokens: 1000,
              temperature: 0.7,
            });

            // Create all messages
            const welcomeMessage = {
              role: "assistant" as const,
              content: `Great! I have data on ${farmName}. Let me analyze the tools and potential profits based on your farm's specific conditions...`,
              timestamp: new Date(),
            };

            const specializedResponse = {
              role: "assistant" as const,
              content:
                completion.choices[0].message?.content ||
                "Sorry, I could not generate a response.",
              timestamp: new Date(),
              analyticsData: await generateChartData(
                completion.choices[0].message?.content || ""
              ),
            };

            const thankYouMessage = {
              role: "assistant" as const,
              content:
                "Thank you for providing your farm information! How can I assist you today?",
              timestamp: new Date(),
            };

            // Update conversation with all messages at once
            setConversation((prev) => ({
              ...prev,
              messages: [
                ...prev.messages,
                welcomeMessage,
                specializedResponse,
                thankYouMessage,
              ],
              farmInfo: updatedFarmInfo,
            }));

            // Add the standard system message separately to ensure it persists
            const standardSystemMessage = {
              role: "system" as const,
              content:
                "You are a knowledgeable farming assistant with expertise in agricultural practices, soil management, and crop analysis. Provide detailed, practical advice while considering soil conditions, climate, and available equipment.",
              timestamp: new Date(),
            };

            // Set the system message for future interactions
            setConversation((prev) => ({
              ...prev,
              messages: [standardSystemMessage, ...prev.messages],
            }));

            // Only add the response if we have valid data
            if (specializedResponse.analyticsData) {
              setConversation((prev) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  specializedResponse,
                  thankYouMessage,
                ],
              }));
            } else {
              console.error("Failed to generate valid analytics data");
              // Notify the user that there was an issue with data generation
              const errorMessage = {
                role: "assistant" as const,
                content:
                  "I analyzed your farm data but encountered an issue generating the analytics. Please try asking your question again.",
                timestamp: new Date(),
              };
              setConversation((prev) => ({
                ...prev,
                messages: [...prev.messages, errorMessage],
              }));
            }

            return {
              role: "assistant" as const,
              content: welcomeMessage.content,
              timestamp: new Date(),
            };
          } catch (error) {
            console.error("Error generating initial response:", error);
            const errorMessage = {
              role: "assistant" as const,
              content: `Great! I have data on ${farmName}. Thank you for providing your farm information! How can I assist you today?`,
              timestamp: new Date(),
            };
            setConversation((prev) => ({
              ...prev,
              messages: [...prev.messages, errorMessage],
            }));
            return errorMessage;
          }
        }
      }
    }

    // Handle other questions normally
    const updatedFarmInfo = {
      ...farmInfo,
      [currentQuestion.key]: content,
    };
    setFarmInfo(updatedFarmInfo);

    if (currentQuestionIndex < FARM_INFO_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion =
        FARM_INFO_QUESTIONS[currentQuestionIndex + 1].question;
      return {
        role: "assistant" as const,
        content: "Thank you! " + nextQuestion,
        timestamp: new Date(),
      };
    } else {
      // All questions answered
      await saveFarmInfo(updatedFarmInfo as FarmInfo);
      setIsCollectingFarmInfo(false);

      // Prepare the specialized first response
      const farmData = getFarmData(updatedFarmInfo.farmName || "");
      const toolstack = farmData
        ? JSON.stringify(farmData.tillageOptions, null, 2)
        : updatedFarmInfo.toolsAvailable;
      const soil = farmData
        ? farmData.soilDescription
        : "No detailed soil data available";

      const systemMessage = `You are an advanced agricultural AI assistant. Your goal is to evaluate each tillage tool from the provided JSON list and estimate the profit for using that tool under the given farm conditions. For each tool, you should provide:
 - An estimated profit value (in $ per acre) based on its operating costs and assumed yield improvements,
 - A brief explanation of how you arrived at that profit estimate.
 - Consider the user's budget when recommending tools and solutions.

After processing all tools, output the results in the following exact format:

Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...
Explanations: tool1_name: explanation, tool2_name: explanation, ...
External Tool: (Recommend one third-party external tool with its price that would enhance efficiency, considering the user's budget if specified.)`;

      const userMessage = `My location is ${updatedFarmInfo.location}. 
My budget is ${updatedFarmInfo.budget}.
My tools are ${toolstack}. 
The description of your soil is ${soil}

Given this scenario, please evaluate each tool from the provided JSON list and estimate the profit (in $ per acre) for using that tool. Be sure to factor in everything provided, including the location, toolstack, budget, as well as the soil data provided. 

For each tool, provide a brief explanation of your profit estimate. In your explanations, ensure that you have indicated which tool is best. The best tool constitutes as that with the highest predicted profit margin.

For the external tool, recommend a third-party external tool with its price that would enhance efficiency. Consider my budget when making recommendations. If the tool exceeds my budget, explain the long-term benefits that might justify the investment. Provide the cost of the tool, the predicted profits, and the weekly profit for that tool. We need the weekly profit to see how long it would take to break even on the external product. 

Next, provide an explanation, similar to your explanation above, on why you picked this tool. Ensure that your answer accounts for the soil data and your explanations give explanations in relation to the soil data that was provided. Be sure to name-drop specific descriptions of the soils that were provided in your explanations. 

Then, output all the results in the following format:

Profits: tool1_name: estimated_profit, tool2_name: estimated_profit, ...
Explanations: tool1_name: explanation, tool2_name: explanation, ...
External Tool: tool_name: tool_cost, predicted_profit, weekly_profit_rate
External Explanation: Why the tool is efficient for the situation we are in.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        // First, add the specialized response
        const specializedResponse = {
          role: "assistant" as const,
          content:
            completion.choices[0].message?.content ||
            "Sorry, I could not generate a response.",
          timestamp: new Date(),
          analyticsData: await generateChartData(
            completion.choices[0].message?.content || ""
          ),
        };

        // Then add the thank you message
        const thankYouMessage = {
          role: "assistant" as const,
          content:
            "Thank you for providing your farm information! How can I assist you today?",
          timestamp: new Date(),
        };

        // Update conversation with both messages
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, specializedResponse, thankYouMessage],
        }));

        // Only add the response if we have valid data
        if (!specializedResponse.analyticsData) {
          console.error("Failed to generate valid analytics data");
          // Notify the user that there was an issue with data generation
          const errorMessage = {
            role: "assistant" as const,
            content:
              "I analyzed your farm data but encountered an issue generating the analytics. Please try asking your question again.",
            timestamp: new Date(),
          };
          setConversation((prev) => ({
            ...prev,
            messages: [...prev.messages, errorMessage],
          }));
        }

        return specializedResponse;
      } catch (error) {
        console.error("Error generating initial response:", error);
        return {
          role: "assistant" as const,
          content:
            "Thank you for providing your farm information! How can I assist you today?",
          timestamp: new Date(),
        };
      }
    }
  };

  const handleSendMessage = async (message: string, image?: string) => {
    try {
      setLoading(true);
      const updatedMessages = [...conversation.messages];

      // Add user message with image if provided
      const userMessage: Message = {
        role: "user",
        content: message,
        image: image,
        timestamp: new Date(),
      };
      updatedMessages.push(userMessage);

      // Update conversation immediately with user message
      setConversation((prev) => ({
        ...prev,
        messages: updatedMessages,
      }));

      // If we're collecting farm info, handle the response accordingly
      if (isCollectingFarmInfo) {
        await handleFarmInfoResponse(message);
        setLoading(false);
        return;
      }

      // Only proceed with API call if we're not collecting farm info
      const systemMessage = {
        role: "system",
        content:
          "You are a knowledgeable farming assistant with expertise in agricultural practices, soil management, and crop analysis. Provide detailed, practical advice while considering soil conditions, climate, and available equipment.",
        timestamp: new Date(),
      };

      // Keep existing system message if present, otherwise add new one
      const finalMessages = [
        (conversation.messages.find((msg) => msg.role === "system") ||
          systemMessage) as Message,
        ...updatedMessages.filter((msg) => msg.role !== "system"),
      ];

      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: image ? "gpt-4o" : "gpt-4o-mini",
        messages: finalMessages.map((msg) => {
          const baseMessage = {
            role: msg.role,
            content: msg.content,
          };

          if (!msg.image) {
            return baseMessage;
          }

          return {
            role: msg.role,
            content: [
              { type: "text", text: msg.content || "" },
              {
                type: "image_url",
                image_url: {
                  url: msg.image,
                  detail: "low",
                },
              },
            ],
          };
        }) as any,
        max_tokens: image ? 1000 : 1000,
        temperature: 0.7,
        presence_penalty: 0,
        frequency_penalty: 0,
        top_p: 1,
        stream: false,
        n: 1,
      });

      // Add assistant message to conversation
      const assistantMessage: Message = {
        role: "assistant",
        content:
          completion.choices[0].message?.content ||
          "Sorry, I could not generate a response.",
        timestamp: new Date(),
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...updatedMessages, assistantMessage],
      }));
    } catch (error) {
      console.error("Error in chat:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    conversation,
    loading,
    error,
    handleSendMessage,
    createConversation,
    isCollectingFarmInfo,
  };
}
