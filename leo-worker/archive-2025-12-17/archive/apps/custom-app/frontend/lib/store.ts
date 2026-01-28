// WebSocket message store
interface WebSocketMessage {
  id: string
  type: string
  timestamp: number
  data: any
}

interface WebSocketStore {
  messages: WebSocketMessage[]
  addMessage: (message: WebSocketMessage) => void
  clearMessages: () => void
}

// In-memory store for WebSocket messages
export const websocketStore: WebSocketStore = {
  messages: [],
  addMessage: (message: WebSocketMessage) => {
    websocketStore.messages.push(message)
    // Keep only last 100 messages
    if (websocketStore.messages.length > 100) {
      websocketStore.messages = websocketStore.messages.slice(-100)
    }
  },
  clearMessages: () => {
    websocketStore.messages = []
  }
}