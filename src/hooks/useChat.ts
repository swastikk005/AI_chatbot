import { useState, useCallback } from 'react';
import type { Message } from '../types';

const SYSTEM_PROMPT = "You are a helpful, concise AI assistant. Format responses with markdown where useful.";

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: 'user', content },
                    ],
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            if (!reader) throw new Error('No reader available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter((line) => line.trim() !== '');

                for (const line of lines) {
                    const message = line.replace(/^data: /, '');
                    if (message === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(message);
                        const contentChunk = parsed.choices[0]?.delta?.content || '';
                        accumulatedContent += contentChunk;

                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
                            )
                        );
                    } catch (e) {
                        console.error('Error parsing chunk', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMessageId
                        ? { ...m, content: 'Sorry, I encountered an error. Please check your API key and try again.' }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const clearChat = useCallback(() => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hi! I'm your AI assistant. How can I help you today?",
                timestamp: new Date(),
            },
        ]);
    }, []);

    return { messages, isLoading, sendMessage, clearChat };
};
