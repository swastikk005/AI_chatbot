import React, { useEffect, useState, useRef, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import Sidebar from './components/Sidebar';
import BootSequence from './components/BootSequence';
import ShortcutsModal from './components/ShortcutsModal';
import Toast from './components/Toast';
import { useChat } from './hooks/useChat';
import { useSpeech } from './hooks/useSpeech';
import { usePersona } from './hooks/usePersona';
import type { PersonaType } from './hooks/usePersona';
import { useTasks } from './hooks/useTasks';
import { useWakeWord } from './hooks/useWakeWord';
import { useVoiceInput } from './hooks/useVoiceInput';
import { Bot, Trash2, Volume2, VolumeX, Settings, UserMinus, ChevronDown, Mic, Radio, Menu, Keyboard, Layers, ClipboardList, Crosshair, Share2 } from 'lucide-react';
import { forgetProfile } from './utils/memory';
import TaskPanel from './components/TaskPanel';
import HUDOverlay from './components/HUDOverlay';
import { encodeChat, decodeChat } from './utils/shareChat';
import type { Message } from './types';

const models = [
    { name: "LLaMA 3.1 8B (Fast)", id: "meta-llama/llama-3.1-8b-instruct:free" },
    { name: "Gemma 2 9B (Smart)", id: "google/gemma-2-9b-it:free" },
    { name: "DeepSeek R1 (Reasoning)", id: "deepseek/deepseek-r1:free" },
    { name: "Liquid LFM 40B (Specialist)", id: "liquid/lfm-40b:free" },
];

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
}

const App: React.FC = () => {
    // Core Hooks
    const {
        messages,
        setMessages,
        isLoading,
        sendMessage,
        clearChat,
        setPdfContext,
        selectedModel,
        setSelectedModel
    } = useChat();

    const handleSendMessageWrapper = useCallback((content: string, imageUrl?: string) => {
        sendMessage(content, imageUrl, addTask);
    }, [sendMessage]);

    const { speak, stop: stopSpeech, isSpeaking, isMuted, toggleMute, isSynthesizing } = useSpeech();
    const { currentPersona, switchPersona, isSwitching, personas } = usePersona();
    const { tasks, addTask } = useTasks();
    const { isStandby: isWakeWordStandby, isFlashing: isWakeWordFlashing, toggleStandby } = useWakeWord();

    const { startListening } = useVoiceInput({
        onTranscript: (t) => handleSendMessageWrapper(t)
    });

    // UI States
    const [isBooted, setIsBooted] = useState(!!sessionStorage.getItem('jarvis_booted'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
    const [hudActive, setHudActive] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showPersonaSelector, setShowPersonaSelector] = useState(false);
    const [prevLoading, setPrevLoading] = useState(false);

    // History States
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    // Share Chat Detection
    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        const chatParam = p.get('chat');
        if (chatParam) {
            const loaded = decodeChat(chatParam);
            if (loaded.length > 0) {
                setMessages([...loaded, {
                    id: Math.random().toString(36).slice(2, 11),
                    role: 'assistant',
                    content: 'Shared mission briefing loaded, sir. You are viewing a shared conversation.',
                    timestamp: new Date()
                }]);
            }
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [setMessages]);

    // The useWakeWord hook is now managed by the new toggleStandby function
    // The previous isWakeWordActive logic is replaced by isWakeWordFlashing for UI indication
    // and isWakeWordStandby for the standby state.

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => setInstallPrompt(null));
    };

    // Load History
    useEffect(() => {
        const saved = localStorage.getItem('jarvis_chat_history');
        if (saved) {
            setSessions(JSON.parse(saved));
        }
    }, []);

    // Save History
    useEffect(() => {
        if (messages.length > 1) {
            const title = messages.find(m => m.role === 'user')?.content.slice(0, 30) || "New Mission";
            const updatedSessions = [...sessions];
            const existingIdx = updatedSessions.findIndex(s => s.id === currentSessionId);

            const sessionData = {
                id: currentSessionId,
                title: title.endsWith('...') ? title : title + '...',
                messages: messages,
                createdAt: new Date().toISOString()
            };

            if (existingIdx > -1) {
                updatedSessions[existingIdx] = sessionData;
            } else {
                updatedSessions.unshift(sessionData);
            }

            const truncated = updatedSessions.slice(0, 20);
            setSessions(truncated);
            localStorage.setItem('jarvis_chat_history', JSON.stringify(truncated));
        }
    }, [messages, currentSessionId]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                toggleMute();
                showToast(isMuted ? "VOICE UNMUTED" : "VOICE MUTED");
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                handleNewChat();
                showToast("NEW MISSION STARTED");
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsSidebarOpen(prev => !prev);
                showToast(isSidebarOpen ? "SIDEBAR CLOSED" : "SIDEBAR OPENED");
            }
            if (e.key === 'Escape') {
                stopSpeech();
                // We'd need to expose stopListening from useVoiceInput, but for now we stop speech
                showToast("SYSTEM HALTED");
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                setShowShortcuts(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMuted, isSidebarOpen, stopSpeech, toggleMute]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
    };

    const handleNewChat = () => {
        clearChat();
        setCurrentSessionId(Date.now().toString());
        setIsSidebarOpen(false);
    };

    const handleSelectChat = (session: ChatSession) => {
        // This requires setMessages to be exposed from useChat
        (setMessages as any)(session.messages);
        setCurrentSessionId(session.id);
        setIsSidebarOpen(false);
        showToast("LOG LOADED");
    };

    const handleDeleteChat = (id: string) => {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        localStorage.setItem('jarvis_chat_history', JSON.stringify(updated));
        if (id === currentSessionId) handleNewChat();
        showToast("LOG DELETED");
    };

    const handleBootComplete = useCallback(() => {
        setIsBooted(true);
        sessionStorage.setItem('jarvis_booted', 'true');
    }, []);

    // Auto-speak new assistant messages
    useEffect(() => {
        if (prevLoading && !isLoading && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                speak(lastMessage.content);
            }
        }
        setPrevLoading(isLoading);
    }, [isLoading, messages, speak, prevLoading]);

    const handleModelChange = (id: string, name: string) => {
        setSelectedModel(id);
        sendMessage(`Switching neural architecture to ${name}, sir. Stand by.`);
    };

    const handleSendMessage = (content: string, imageUrl?: string) => {
        sendMessage(content, imageUrl, addTask);
    };

    const handleSwitchPersona = (type: PersonaType) => {
        switchPersona(type);
        setShowPersonaSelector(false);
        showToast(`${type} ACTIVATED`);
    };

    const handleShare = () => {
        const encoded = encodeChat(messages);
        if (!encoded) {
            showToast('ENCODING FAILED');
            return;
        }
        const url = window.location.origin + window.location.pathname + '?chat=' + encoded;
        if (url.length > 4000) {
            showToast('MISSION DATA TOO LARGE');
            return;
        }
        navigator.clipboard.writeText(url)
            .then(() => showToast('BRIEFING LINK COPIED'))
            .catch(() => showToast('CLIPBOARD DENIED'));
    };

    const handleToggleHUD = () => {
        setHudActive(!hudActive);
        showToast(hudActive ? 'HUD DEACTIVATED' : 'HUD ONLINE');
    };

    const handleForgetMe = () => {
        forgetProfile();
        clearChat();
        setShowSettings(false);
        showToast("MEMORY PURGED");
    };

    if (!isBooted || isSwitching) {
        return <BootSequence onComplete={handleBootComplete} />;
    }

    return (
        <div className="flex h-screen bg-[#0f0f1a] text-gray-100 font-sans selection:bg-[var(--jarvis-accent)]/30 overflow-hidden">

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                sessions={sessions}
                currentSessionId={currentSessionId}
            />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
                {/* Header */}
                <header className="flex-shrink-0 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-50 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-[var(--jarvis-accent)] transition-all"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--jarvis-accent)]/10 rounded-xl transition-colors duration-500">
                                <Bot size={24} className="text-[var(--jarvis-accent)] transition-colors duration-500" />
                            </div>
                            <div>
                                <h1 className={`text-lg font-bold tracking-tight transition-all duration-500 bg-clip-text text-transparent
                                    ${isSpeaking ? 'animate-pulse opacity-100 bg-[var(--jarvis-accent)]' : 'opacity-80 bg-white'}`}>
                                    {isWakeWordFlashing ? 'ACTIVATED' : currentPersona.name}
                                </h1>
                                <div className="flex items-center gap-1.5 leading-none mt-0.5">
                                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_var(--jarvis-accent)] transition-all duration-500 ${isWakeWordStandby ? 'bg-[#00c96b] animate-pulse' : 'bg-gray-600'}`}></span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        {isWakeWordStandby ? '● STANDBY' : '○ OFFLINE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PWA Install Button */}
                    {installPrompt && (
                        <button
                            onClick={handleInstall}
                            className="mr-2 px-3 py-1.5 bg-[var(--jarvis-accent)]/10 border border-[var(--jarvis-accent)]/30 rounded-lg text-[10px] font-mono font-bold text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]/20 transition-all flex items-center gap-2"
                        >
                            <Bot size={14} />
                            ⬇ INSTALL
                        </button>
                    )}

                    <div className="flex items-center gap-4">
                        {/* Status Indicators */}
                        {isSpeaking && (
                            <button
                                onClick={stopSpeech}
                                className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full hover:bg-red-500/20 transition-all group"
                            >
                                <VolumeX size={12} className="text-red-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-tighter">Stop Reading</span>
                            </button>
                        )}

                        {isSynthesizing && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-[var(--jarvis-accent)]/5 border border-[var(--jarvis-accent)]/20 rounded-full animate-pulse hidden sm:flex transition-colors duration-500">
                                <Radio size={12} className="text-[var(--jarvis-accent)]" />
                                <span className="text-[9px] font-mono font-bold text-[var(--jarvis-accent)] uppercase">Synthesising Voice...</span>
                            </div>
                        )}

                        {/* Model Selector */}
                        <div className="relative group hidden md:block">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-[var(--jarvis-accent)] hover:bg-white/10 transition-all">
                                {models.find(m => m.id === selectedModel)?.name.split(' (')[0]}
                                <ChevronDown size={12} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                {models.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => handleModelChange(m.id, m.name)}
                                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--jarvis-accent)]/10 transition-colors ${selectedModel === m.id ? 'text-[var(--jarvis-accent)] bg-[var(--jarvis-accent)]/5' : 'text-gray-400'
                                            }`}
                                    >
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* HUD Toggle */}
                        <button
                            onClick={handleToggleHUD}
                            className={`p-2 rounded-lg transition-all ${hudActive ? 'bg-[var(--jarvis-accent)]/20 text-[var(--jarvis-accent)] scale-110' : 'text-gray-400 hover:bg-white/5'}`}
                            title="Iron Man HUD"
                        >
                            <Crosshair size={20} />
                        </button>

                        {/* Wake Word Toggle */}
                        <button
                            onClick={() => toggleStandby(() => startListening())}
                            className={`p-2 rounded-lg transition-all ${isWakeWordStandby ? 'bg-[#00c96b]/10 text-[#00c96b]' : 'text-gray-400 hover:bg-white/5'}`}
                            title="Wake Word Detection"
                        >
                            <Mic size={20} className={isWakeWordFlashing ? 'animate-ping' : ''} />
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-[var(--jarvis-accent)] transition-all"
                            title="Share Briefing"
                        >
                            <Share2 size={20} />
                        </button>

                        {/* Persona Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPersonaSelector(!showPersonaSelector)}
                                className={`p-2 rounded-lg transition-all ${showPersonaSelector ? 'bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Layers size={20} />
                            </button>
                            {showPersonaSelector && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                                    {personas.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSwitchPersona(p.id)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                                                <span>{p.name}</span>
                                            </div>
                                            {currentPersona.id === p.id && <div className="w-1 h-1 bg-[var(--jarvis-accent)] rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Voice Toggle */}
                        <button
                            onClick={toggleMute}
                            className={`flex flex-col items-center gap-0.5 min-w-[40px] transition-all duration-300 hover:scale-105 ${isMuted ? 'text-gray-500' : 'text-[var(--jarvis-accent)]'
                                }`}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className={isSpeaking ? 'animate-bounce' : ''} />}
                            <span className="text-[7px] font-mono font-bold tracking-tighter uppercase whitespace-nowrap">
                                {isMuted ? 'Muted' : 'Volume'}
                            </span>
                        </button>

                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Settings size={20} />
                            </button>
                            {showSettings && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in text-[var(--jarvis-accent)]">
                                    <button
                                        onClick={handleForgetMe}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <UserMinus size={16} />
                                        <span>FORGET ME</span>
                                    </button>
                                    <button
                                        onClick={handleNewChat}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:bg-white/5 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span>Clear Buffer</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-0 relative bg-[#0f0f1a]">
                    <ChatWindow messages={messages} isLoading={isLoading} onSendMessage={handleSendMessageWrapper} isSpeaking={isSpeaking} />
                </main>

                {/* Input Section */}
                <footer className="flex-shrink-0 z-40 bg-gradient-to-t from-[#0f0f1a] to-transparent pt-4 relative">
                    <InputBar
                        onSendMessage={handleSendMessageWrapper}
                        isLoading={isLoading}
                        onPdfContent={setPdfContext}
                    />

                    {/* Floating Icons */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <button
                            onClick={() => setShowShortcuts(true)}
                            className="p-2 rounded-full bg-white/5 text-gray-500 hover:text-[var(--jarvis-accent)] hover:bg-white/10 transition-all opacity-40 hover:opacity-100 hidden sm:block"
                            title="Keyboard Shortcuts"
                        >
                            <Keyboard size={16} />
                        </button>
                        <button
                            onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
                            className={`p-2 rounded-full transition-all flex items-center justify-center relative ${isTaskPanelOpen ? 'bg-[var(--jarvis-accent)]/20 text-[var(--jarvis-accent)]' : 'bg-white/5 text-gray-500 hover:text-[var(--jarvis-accent)] hover:bg-white/10'}`}
                            title="Missions"
                        >
                            <ClipboardList size={16} />
                            {tasks.filter(t => !t.done).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
                            )}
                        </button>
                    </div>
                </footer>
            </div>

            {/* Overlays */}
            <HUDOverlay active={hudActive} />
            {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
            {isTaskPanelOpen && <TaskPanel isOpen={isTaskPanelOpen} onClose={() => setIsTaskPanelOpen(false)} />}
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

        </div>
    );
};

export default App;
