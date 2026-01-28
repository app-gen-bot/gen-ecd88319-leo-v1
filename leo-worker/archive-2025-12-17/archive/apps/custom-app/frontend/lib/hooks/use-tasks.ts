import { useState, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { apiClient } from '@/lib/api-client'
import { useTaskUpdates } from '@/lib/contexts/websocket-context'
import { useToast } from '@/components/ui/use-toast'
import type { Task } from '@/lib/types'

interface UseTasksOptions {
  status?: string
  assignee_id?: string
  category?: string
}

export function useTasks(options?: UseTasksOptions) {
  const { toast } = useToast()
  
  const { data, error, isLoading } = useSWR(
    ['tasks', options],
    () => apiClient.getTasks(options),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )
  
  // Handle real-time updates
  useTaskUpdates(useCallback((task: Task) => {
    // Optimistically update the cache
    mutate(['tasks', options], (currentTasks: Task[] = []) => {
      const exists = currentTasks.find(t => t.id === task.id)
      if (exists) {
        // Update existing task
        return currentTasks.map(t => t.id === task.id ? task : t)
      } else {
        // Add new task
        return [task, ...currentTasks]
      }
    }, false)
  }, [options]))
  
  const createTask = useCallback(async (taskData: Parameters<typeof apiClient.createTask>[0]) => {
    try {
      const newTask = await apiClient.createTask(taskData)
      
      // Update cache
      mutate(['tasks', options])
      
      toast({
        title: "Task Created!",
        description: "Your lovely task has been sent.",
      })
      
      return newTask
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      })
      throw error
    }
  }, [options, toast])
  
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await apiClient.updateTask(id, updates)
      
      // Update cache
      mutate(['tasks', options])
      
      return updated
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      })
      throw error
    }
  }, [options, toast])
  
  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiClient.deleteTask(id)
      
      // Update cache
      mutate(['tasks', options])
      
      toast({
        title: "Task Deleted",
        description: "The task has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      })
      throw error
    }
  }, [options, toast])
  
  const respondToTask = useCallback(async (
    id: string, 
    response: Parameters<typeof apiClient.respondToTask>[1]
  ) => {
    try {
      const result = await apiClient.respondToTask(id, response)
      
      // Update cache
      mutate(['tasks', options])
      
      if (response.response_type === 'complete') {
        toast({
          title: "Task Completed! 🎉",
          description: "Great job! Your love score has increased.",
        })
      } else {
        toast({
          title: "Response Sent",
          description: "Your response has been recorded.",
        })
      }
      
      return result
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to task",
        variant: "destructive",
      })
      throw error
    }
  }, [options, toast])
  
  return {
    tasks: data || [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    respondToTask,
    refresh: () => mutate(['tasks', options])
  }
}

export function useTask(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['task', id] : null,
    () => apiClient.getTask(id),
    {
      revalidateOnFocus: false
    }
  )
  
  // Handle real-time updates
  useTaskUpdates(useCallback((task: Task) => {
    if (task.id === id) {
      mutate(['task', id], task, false)
    }
  }, [id]))
  
  return {
    task: data,
    isLoading,
    error,
    refresh: () => mutate(['task', id])
  }
}