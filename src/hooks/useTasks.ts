import { useState, useEffect, useCallback } from 'react';

export interface Task {
    id: string;
    title: string;
    time?: string;
    done: boolean;
    createdAt: number;
}

export const detectTaskQuery = (message: string): boolean => {
    const keywords = ["remind me", "add task", "todo", "don't forget", "remember to", "set a reminder", "make a note"];
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
};

export const parseTask = (message: string): { title: string, time?: string } => {
    let title = message.toLowerCase();

    // Remove command words
    const commands = ["remind me to", "add task", "todo", "don't forget to", "remember to", "set a reminder to", "make a note to", "remind me"];
    commands.forEach(cmd => {
        title = title.replace(cmd, '');
    });

    // Extract time (e.g., "at 6pm", "at 18:00")
    const timeMatch = title.match(/at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    let time = undefined;
    if (timeMatch) {
        time = timeMatch[1].trim();
        title = title.replace(`at ${timeMatch[1]}`, '');
    }

    return {
        title: title.trim().charAt(0).toUpperCase() + title.trim().slice(1),
        time
    };
};

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('jarvis_tasks');
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    const saveTasks = (newTasks: Task[]) => {
        setTasks(newTasks);
        localStorage.setItem('jarvis_tasks', JSON.stringify(newTasks));
    };

    const addTask = useCallback(async (title: string, time?: string) => {
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title,
            time,
            done: false,
            createdAt: Date.now(),
        };

        const updated = [newTask, ...tasks];
        saveTasks(updated);

        // Schedule notification if time is provided
        if (time) {
            // Simple timer for demo (ideally would use a more robust scheduler)
            const [hours, minutes] = time.replace(/(am|pm)/i, '').split(':').map(Number);
            const now = new Date();
            const target = new Date();
            target.setHours(hours + (time.toLowerCase().includes('pm') && hours < 12 ? 12 : 0));
            target.setMinutes(minutes || 0);

            const delay = target.getTime() - now.getTime();
            if (delay > 0) {
                setTimeout(() => {
                    new Notification("J.A.R.V.I.S. REMINDER", {
                        body: title,
                        icon: "/icon-192.svg"
                    });
                }, delay);
            }
        }
    }, [tasks]);

    const toggleDone = (id: string) => {
        const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        saveTasks(updated);
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        saveTasks(updated);
    };

    const clearCompleted = () => {
        const updated = tasks.filter(t => !t.done);
        saveTasks(updated);
    };

    return { tasks, addTask, toggleDone, deleteTask, clearCompleted };
};
