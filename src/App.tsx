import React from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import { useChat } from './hooks/useChat';
import { Bot, Trash2 } from 'lucide-react';

const App: React.FC = () => {
    const { messages, isLoading, sendMessage, clearChat } = useChat();

    return (
        <div className="flex flex-col h-screen bg-[#0f0f1a] text-gray-100 font-sans selection:bg-[#00c96b]/30">
            {/* Header */}
            <header className="flex-shrink-0 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-10 shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00c96b]/10 rounded-xl">
                        <Bot size={24} className="text-[#00c96b]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            AI Assistant
                        </h1>
                        <div className="flex items-center gap-1.5 leading-none mt-0.5">
                            <span className="w-2 h-2 bg-[#00c96b] rounded-full shadow-[0_0_8px_rgba(0,201,107,0.8)] animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-200"
                    >
                        <Trash2 size={14} />
                        <span>Clear Chat</span>
                    </button>

                    <div className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-sm font-bold group-hover:border-[#00c96b]/30 text-white">
                            U
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00c96b] rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]"></div>
                </div>

                <ChatWindow messages={messages} isLoading={isLoading} onSendMessage={sendMessage} />
            </main>

            {/* Input Section */}
            <footer className="flex-shrink-0 z-10 sticky bottom-0">
                <InputBar onSendMessage={sendMessage} isLoading={isLoading} />
            </footer>
        </div>
    );
};

export default App;
