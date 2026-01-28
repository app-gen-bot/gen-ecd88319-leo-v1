"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";

interface SlackData {
  currentUser: any | null;
  currentWorkspace: any | null;
  channels: any[];
  users: any[];
  isLoading: boolean;
  error: string | null;
}

export function useSlackData() {
  const [data, setData] = useState<SlackData>({
    currentUser: null,
    currentWorkspace: null,
    channels: [],
    users: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user from localStorage or session
        const storedUser = localStorage.getItem("current_user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (!currentUser) {
          const session = await apiClient.getSession();
          if (session.valid) {
            localStorage.setItem("current_user", JSON.stringify(session.user));
            setData(prev => ({ ...prev, currentUser: session.user }));
          }
        } else {
          setData(prev => ({ ...prev, currentUser }));
        }

        // Get current workspace
        const workspace = await apiClient.getCurrentWorkspace();
        setData(prev => ({ ...prev, currentWorkspace: workspace }));
        localStorage.setItem("current_workspace", JSON.stringify(workspace));

        // Get channels for the workspace
        const channels = await apiClient.getChannels(workspace.id);
        setData(prev => ({ ...prev, channels }));

        // Get users in the workspace
        const users = await apiClient.getUsers(workspace.id);
        setData(prev => ({ ...prev, users }));

        setData(prev => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        console.error("Error loading Slack data:", error);
        setData(prev => ({
          ...prev,
          error: error.message || "Failed to load data",
          isLoading: false,
        }));
      }
    };

    loadData();
  }, []);

  const sendMessage = async (channelId: string, content: string) => {
    try {
      const message = await apiClient.sendMessage({
        channel_id: channelId,
        content,
      });
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const createChannel = async (name: string, type: "Public" | "Private" = "Public") => {
    if (!data.currentWorkspace) return;

    try {
      const channel = await apiClient.createChannel({
        workspace_id: data.currentWorkspace.id,
        name,
        type,
      });
      
      // Refresh channels list
      const channels = await apiClient.getChannels(data.currentWorkspace.id);
      setData(prev => ({ ...prev, channels }));
      
      return channel;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  };

  return {
    ...data,
    sendMessage,
    createChannel,
    refreshData: () => {
      // Trigger a refresh
      setData(prev => ({ ...prev, isLoading: true }));
    },
  };
}