import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type StatusMessageLevel = 'info' | 'success' | 'warning' | 'error';
export type StatusMessagePriority = 'low' | 'medium' | 'high';

export interface StatusMessage {
  id: string;
  message: string;
  level: StatusMessageLevel;
  timestamp: number;
  priority: StatusMessagePriority;
  source?: string;
}

interface StatusMessageContextValue {
  messages: StatusMessage[];
  latestMessage: StatusMessage | null;
  highestPriorityMessage: StatusMessage | null;
  pushMessage: (
    message: string,
    level?: StatusMessageLevel,
    options?: { source?: string; priority?: StatusMessagePriority }
  ) => void;
  dismissMessage: (id: string) => void;
  clearMessages: () => void;
}

const StatusMessageContext = createContext<StatusMessageContextValue | undefined>(undefined);

const createMessageId = () => `status-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const MAX_MESSAGES = 5;

export const StatusMessageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const pushMessage = useCallback((
    message: string,
    level: StatusMessageLevel = 'info',
    options?: { source?: string; priority?: StatusMessagePriority }
  ) => {
    setMessages(prev => {
      const nextMessage: StatusMessage = {
        id: createMessageId(),
        message,
        level,
        timestamp: Date.now(),
        priority: options?.priority ?? (level === 'error' ? 'high' : level === 'warning' ? 'medium' : 'low')
      };

      if (options?.source) {
        nextMessage.source = options.source;
      }

      const next: StatusMessage[] = [...prev, nextMessage];
      return next.slice(-MAX_MESSAGES);
    });
  }, []);

  const dismissMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const highestPriorityMessage = useMemo(() => {
    if (messages.length === 0) {
      return null;
    }

    return [...messages].sort((a, b) => {
      const priorityRank = { high: 3, medium: 2, low: 1 } as const;
      const diff = priorityRank[b.priority] - priorityRank[a.priority];
      if (diff !== 0) {
        return diff;
      }
      return b.timestamp - a.timestamp;
    })[0];
  }, [messages]);

  const value = useMemo<StatusMessageContextValue>(() => ({
    messages,
    latestMessage: messages.length > 0 ? messages[messages.length - 1] : null,
    highestPriorityMessage,
    pushMessage,
    dismissMessage,
    clearMessages
  }), [messages, pushMessage, dismissMessage, clearMessages, highestPriorityMessage]);

  return (
    <StatusMessageContext.Provider value={value}>
      {children}
    </StatusMessageContext.Provider>
  );
};

export const useStatusMessages = (): StatusMessageContextValue => {
  const context = useContext(StatusMessageContext);
  if (!context) {
    throw new Error('useStatusMessages must be used within a StatusMessageProvider');
  }
  return context;
};
