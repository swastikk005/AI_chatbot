import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import { Sparkles } from 'lucide-react';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Explain React hooks in simple terms",
        "Write a Python script to rename files",
        "Give me 5 startup ideas for 2026",
        "How do I negotiate my freelance rate?"
    ];

    // Auto-scroll to bottom on new messages or loading state change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const isEmpty = messages.length <= 1 && !isLoading;

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
            <div className="max-w-3xl mx-auto space-y-2">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}

                {/* Suggested Prompts */}
                {isEmpty && (
                    <div className="mt-8 animate-fade-in px-12">
                        <div className="flex items-center gap-2 mb-4 text-[#00c96b]/60">
                            <Sparkles size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Suggested for you</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {suggestions.map((text, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSendMessage(text)}
                                    className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-[#00c96b]/10 hover:border-[#00c96b]/30 hover:text-white transition-all duration-200 group"
                                >
                                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                                        {text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Thinking Indicator */}
                {isLoading && (
                    <div className="flex w-full mb-6 justify-start animate-fade-in">
                        <div className="flex items-end gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white border border-white/10 font-bold text-sm shadow-lg">
                                AI
                            </div>
                            <div className="px-4 py-3 bg-[#1a1a2e] border border-white/5 rounded-2xl rounded-bl-none shadow-md flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#00c96b] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#00c96b] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#00c96b] rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
