import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
    onClose: () => void;
}

const shortcuts = [
    { key: "Ctrl + M", description: "Toggle Microphone" },
    { key: "Ctrl + K", description: "New Mission" },
    { key: "Ctrl + B", description: "Toggle Sidebar" },
    { key: "Escape", description: "Stop Speech & Listening" },
    { key: "Ctrl + /", description: "Open System Commands" },
];

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-[#060d18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Command size={16} className="text-[#38bdf8]" />
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">System Commands</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:text-[#38bdf8] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <table className="w-full text-left font-mono text-[10px]">
                        <thead>
                            <tr className="text-gray-500 uppercase tracking-wider border-b border-white/5">
                                <th className="pb-3 font-medium">Shortcut</th>
                                <th className="pb-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {shortcuts.map((s, i) => (
                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="py-4 text-[#38bdf8] font-bold">{s.key}</td>
                                    <td className="py-4">{s.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Neural interface active, sir.</p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsModal;
