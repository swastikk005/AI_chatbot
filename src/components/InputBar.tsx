import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface InputBarProps {
    onSendMessage: (content: string) => void;
    isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-[#0f0f1a]/80 backdrop-blur-lg border-t border-white/5 px-4 py-4 sm:px-6">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
                <div className="relative flex-1 group">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder={isLoading ? "AI is thinking..." : "Message AI Assistant..."}
                        className={`w-full bg-[#1a1a2e] text-gray-100 rounded-2xl px-4 py-3 outline-none resize-none 
              border border-white/10 transition-all duration-200
              focus:border-[#00c96b]/50 focus:ring-2 focus:ring-[#00c96b]/20 focus:shadow-[0_0_15px_-3px_rgba(0,201,107,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                </div>

                <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className={`p-3.5 rounded-2xl bg-[#00c96b] text-[#0f0f1a] shadow-lg shadow-[#00c96b]/20 
            hover:scale-105 active:scale-95 transition-all duration-200
            disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed`}
                >
                    <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
                </button>
            </div>
            <p className="text-[10px] text-center text-gray-500 mt-2 opacity-50">
                Press Enter for send, Shift+Enter for newline
            </p>
        </div>
    );
};

export default InputBar;
