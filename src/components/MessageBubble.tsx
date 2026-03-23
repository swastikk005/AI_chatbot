import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { Copy, Check, ThumbsUp, ThumbsDown, Clipboard } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Trigger highlight.js on content change
    useEffect(() => {
        if ((window as any).hljs) {
            (window as any).hljs.highlightAll();
        }
    }, [message.content]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`flex w-full mb-6 relative group ${isUser ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
          ${isUser ? 'bg-[#00c96b] text-[#0f0f1a]' : 'bg-[#1a1a2e] text-white border border-white/10'}`}>
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Message Content Container */}
                <div className="flex flex-col gap-1 relative">
                    <div className={`px-4 py-3 rounded-2xl shadow-md transition-all duration-200
            ${isUser
                            ? 'bg-[#00c96b] text-[#0f0f1a] rounded-br-none'
                            : 'bg-[#1a1a2e] text-gray-100 border border-white/5 rounded-bl-none'}`}>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="m-0 leading-relaxed whitespace-pre-wrap font-sans">{children}</p>,
                                    code: ({ node, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');
                                        const [blockCopied, setBlockCopied] = useState(false);

                                        const handleCopyCode = () => {
                                            navigator.clipboard.writeText(codeString);
                                            setBlockCopied(true);
                                            setTimeout(() => setBlockCopied(false), 2000);
                                        };

                                        return !match ? (
                                            <code className="bg-black/30 rounded px-1.5 py-0.5 text-xs font-mono text-pink-400" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <div className="relative group/code my-4">
                                                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={handleCopyCode}
                                                        className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all"
                                                        title="Copy code"
                                                    >
                                                        {blockCopied ? <Check size={14} className="text-[#00c96b]" /> : <Clipboard size={14} className="text-gray-400" />}
                                                    </button>
                                                </div>
                                                <pre className="!bg-black/40 !p-4 rounded-xl border border-white/10 !my-0 overflow-x-auto">
                                                    <code className={`${className} font-mono text-xs leading-relaxed`}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            </div>
                                        )
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[10px] opacity-40 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Message Actions (Hover only, Assistant only) */}
                    {!isUser && isHovered && (
                        <div className="absolute top-0 right-[-45px] flex flex-col gap-1 animate-fade-in">
                            <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-gray-400 hover:text-white hover:border-[#00c96b]/30 transition-all shadow-xl"
                                title="Copy message"
                            >
                                {copied ? <Check size={14} className="text-[#00c96b]" /> : <Copy size={14} />}
                            </button>
                            <button className="p-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-gray-400 hover:text-[#00c96b] hover:border-[#00c96b]/30 transition-all shadow-xl">
                                <ThumbsUp size={14} />
                            </button>
                            <button className="p-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all shadow-xl">
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
