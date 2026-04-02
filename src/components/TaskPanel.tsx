import { CheckCircle2, Circle, Trash2, X, ClipboardList } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

interface TaskPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const TaskPanel: React.FC<TaskPanelProps> = ({ isOpen, onClose }) => {
    const { tasks, toggleDone, deleteTask, clearCompleted } = useTasks();
    const activeTasks = tasks.filter(t => !t.done);
    const hasCompleted = tasks.some(t => t.done);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 w-72 max-h-[400px] bg-[#060d18]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#38bdf8]" />
                    <h3 className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase tracking-widest">Active Missions</h3>
                    <span className="bg-[#38bdf8]/20 text-[#38bdf8] text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {activeTasks.length}
                    </span>
                </div>
                <button onClick={onClose} className="p-1 hover:text-[#38bdf8] transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                <div className="flex flex-col gap-1">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${task.done ? 'opacity-40 bg-transparent' : 'bg-white/5 hover:bg-white-[0.08]'
                                }`}
                        >
                            <button
                                onClick={() => toggleDone(task.id)}
                                className={`mt-0.5 transition-colors ${task.done ? 'text-[#00ff87]' : 'text-gray-500 hover:text-[#38bdf8]'}`}
                            >
                                {task.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-medium leading-tight ${task.done ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                                    {task.title}
                                </div>
                                {task.time && (
                                    <div className="text-[9px] font-mono text-gray-500 mt-1 uppercase tracking-wider">
                                        ⚡ AT {task.time}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-2 opacity-30">
                            <ClipboardList size={24} />
                            <p className="text-[10px] font-mono italic">No active missions, sir.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {hasCompleted && (
                <div className="p-3 border-t border-white/5 bg-white/[0.01]">
                    <button
                        onClick={clearCompleted}
                        className="w-full py-1.5 text-[9px] font-mono font-bold text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all uppercase tracking-widest rounded-lg"
                    >
                        Clear Completed
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskPanel;
