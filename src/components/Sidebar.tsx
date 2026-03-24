import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock } from 'lucide-react';
import type { Message } from '../types';

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    onSelectChat: (session: ChatSession) => void;
    onDeleteChat: (id: string) => void;
    sessions: ChatSession[];
    currentSessionId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    sessions,
    currentSessionId
}) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 w-[260px] bg-[#060d18] border-r border-white/5 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase tracking-[0.2em]">Mission Logs</h2>
                    <button onClick={onClose} className="p-1 hover:text-[#38bdf8] transition-colors lg:hidden">
                        <X size={18} />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <button
                        onClick={onNewChat}
                        className="w-full py-2.5 px-4 rounded-xl border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center gap-2 hover:bg-[#38bdf8]/20 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <Plus size={16} />
                        New Mission
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="flex flex-col gap-1">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentSessionId === session.id
                                        ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                                onClick={() => onSelectChat(session)}
                            >
                                <div className="flex-shrink-0">
                                    <MessageSquare size={16} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate pr-6">{session.title}</div>
                                    <div className="flex items-center gap-1 mt-1 opacity-40">
                                        <Clock size={10} />
                                        <span className="text-[9px]">
                                            {new Date(session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(session.id);
                                    }}
                                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}

                        {sessions.length === 0 && (
                            <div className="text-center py-10">
                                <div className="text-[10px] text-gray-500 font-mono italic">No logs recorded, sir.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="text-[9px] text-gray-600 font-mono uppercase text-center tracking-widest">
                        Stark OS v2.04
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
