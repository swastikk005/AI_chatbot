import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { Copy, Check, ThumbsUp, ThumbsDown, Clipboard } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    isSpoken?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSpoken }) => {
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
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-transform duration-300
          ${isUser ? 'bg-[#00c96b] text-[#0f0f1a]' : 'bg-[#1a1a2e] text-white border border-white/10'}
          ${!isUser && isSpoken ? 'scale-110 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : ''}`}>
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Message Content Container */}
                <div className="flex flex-col gap-1 relative">
                    <div className={`px-4 py-3 rounded-2xl shadow-md transition-all duration-300 relative
            ${isUser
                            ? 'bg-[#00c96b] text-[#0f0f1a] rounded-br-none'
                            : 'bg-[#1a1a2e] text-gray-100 border border-white/5 rounded-bl-none'}
            ${!isUser && isSpoken ? 'border-l-2 border-l-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.1)]' : ''}`}>

                        {/* Speaking Glow Animation */}
                        {!isUser && isSpoken && (
                            <div className="absolute inset-0 rounded-2xl bg-[#38bdf8]/5 animate-pulse pointer-events-none"></div>
                        )}

                        <div className="prose prose-invert prose-sm max-w-none relative z-10">
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

                            {/* Inline Image Rendering */}
                            {message.imageUrl && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in group/img relative">
                                    <img
                                        src={message.imageUrl}
                                        alt="Generated by J.A.R.V.I.S."
                                        className="w-full h-auto max-h-[512px] object-cover transition-transform duration-500 group-hover/img:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                                        <span className="text-[10px] text-white/60 font-mono tracking-tighter">RENDERED BY POLLINATIONS.AI</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[10px] opacity-40 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Message Actions */}
                    {!isUser && isHovered && (
                        <div className="absolute top-0 right-[-45px] flex flex-col gap-1 animate-fade-in">
                            <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-gray-400 hover:text-white hover:border-[#38bdf8]/30 transition-all shadow-xl"
                                title="Copy message"
                            >
                                {copied ? <Check size={14} className="text-[#00c96b]" /> : <Copy size={14} />}
                            </button>
                            <button className="p-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-gray-400 hover:text-[#38bdf8] hover:border-[#38bdf8]/30 transition-all shadow-xl">
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
