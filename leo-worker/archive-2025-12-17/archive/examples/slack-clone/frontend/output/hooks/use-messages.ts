"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";

export function useMessages(channelId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!channelId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.getMessages(channelId);
        setMessages(data);
      } catch (err: any) {
        console.error("Error loading messages:", err);
        setError(err.message || "Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [channelId]);

  const sendMessage = async (content: string) => {
    try {
      const message = await apiClient.sendMessage({
        channel_id: channelId,
        content,
      });
      
      // Add the new message to the list
      setMessages(prev => [...prev, message]);
      
      return message;
    } catch (err: any) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      const updated = await apiClient.editMessage(messageId, content);
      
      // Update the message in the list
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updated : msg)
      );
      
      return updated;
    } catch (err: any) {
      console.error("Error editing message:", err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await apiClient.deleteMessage(messageId);
      
      // Remove the message from the list
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err: any) {
      console.error("Error deleting message:", err);
      throw err;
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.addReaction(messageId, emoji);
      
      // In a real app, we'd update the message reactions
      // For now, we'll refetch messages
      const data = await apiClient.getMessages(channelId);
      setMessages(data);
    } catch (err: any) {
      console.error("Error adding reaction:", err);
      throw err;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    editMessage,
    updateMessage: editMessage,  // alias for component compatibility
    deleteMessage,
    addReaction,
  };
}