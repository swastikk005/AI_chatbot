import type { Message } from '../types';

export const encodeChat = (messages: Message[]): string => {
    try {
        // Slim down the messages to reduce URL length
        const slim = messages.map(m => ({
            r: m.role === 'user' ? 'u' : 'a',
            c: m.content
        }));
        const json = JSON.stringify(slim);
        return btoa(encodeURIComponent(json));
    } catch (error) {
        console.error('Encoding failed:', error);
        return '';
    }
};

export const decodeChat = (encoded: string): Message[] => {
    try {
        const json = decodeURIComponent(atob(encoded));
        const parsed = JSON.parse(json);
        return parsed.map((x: any) => ({
            id: Math.random().toString(36).slice(2, 11),
            role: x.r === 'u' ? 'user' : 'assistant',
            content: x.c,
            timestamp: new Date()
        }));
    } catch (error) {
        console.error('Decoding failed:', error);
        return [];
    }
};
