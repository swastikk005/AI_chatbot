import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, FileText, X } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { extractPDFText } from '../utils/pdf';

interface InputBarProps {
    onSendMessage: (content: string, imageUrl?: string) => void;
    isLoading: boolean;
    onPdfContent: (content: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({
    onSendMessage,
    isLoading,
    onPdfContent
}) => {
    const [input, setInput] = useState('');
    const [pdfName, setPdfName] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isListening, startListening, stopListening, isSupported } = useVoiceInput({
        onTranscript: (transcript) => {
            setInput(transcript);
            if (transcript.trim()) {
                onSendMessage(transcript);
                setInput('');
            }
        }
    });

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfName(file.name);
            const text = await extractPDFText(file);
            onPdfContent(text);
            onSendMessage(`I've uploaded a document: "${file.name}". Please analyze it, sir.`);
        }
    };

    const clearPdf = () => {
        setPdfName('');
        onPdfContent('');
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    return (
        <div className="max-w-3xl mx-auto px-4 pb-6 pt-2">
            <div className="relative group">

                {/* PDF Badge */}
                {pdfName && (
                    <div className="absolute -top-10 left-2 flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1.5 rounded-full animate-fade-in shadow-lg backdrop-blur-md">
                        <FileText size={14} className="text-[#38bdf8]" />
                        <span className="text-[10px] font-mono text-gray-200 truncate max-w-[150px]">{pdfName} loaded</span>
                        <button onClick={clearPdf} className="text-gray-400 hover:text-red-400 transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl focus-within:border-[#38bdf8]/30 transition-all duration-300">

                    {/* PDF Upload Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="flex-shrink-0 p-3 rounded-xl bg-white/5 text-[#38bdf8]/70 hover:bg-white/10 hover:text-[#38bdf8] transition-all"
                    >
                        <Paperclip size={20} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                        />
                    </button>

                    {/* Microphone Button */}
                    {isSupported && (
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            disabled={isLoading}
                            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 relative group/mic ${isListening
                                ? 'bg-[#38bdf8]/20 text-[#38bdf8]'
                                : 'bg-white/5 text-[#38bdf8]/70 hover:bg-white/10 hover:text-[#38bdf8]'
                                }`}
                        >
                            {isListening && (
                                <span className="absolute inset-0 rounded-xl bg-[#38bdf8] animate-[ping_1.5s_infinite] opacity-20"></span>
                            )}
                            <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
                        </button>
                    )}

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Say something..." : "Message J.A.R.V.I.S..."}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-3 px-2 resize-none max-h-[200px] overflow-y-auto scrollbar-none text-sm leading-relaxed font-sans"
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${input.trim() && !isLoading
                            ? 'bg-[#38bdf8] text-[#0f0f1a] shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputBar;
