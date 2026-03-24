import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out
        }, 1500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] transition-all duration-300 transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            <div className="bg-[#38bdf8]/10 border border-[#38bdf8]/30 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                    {message}
                </span>
            </div>
        </div>
    );
};

export default Toast;
