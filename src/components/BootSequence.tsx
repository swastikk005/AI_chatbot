import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
    onComplete: () => void;
}

const lines = [
    "► NEURAL NETWORK.......... ONLINE",
    "► VOICE SYNTHESIS......... ONLINE",
    "► WEATHER MODULE.......... ONLINE",
    "► MARKET DATA............. ONLINE",
    "► NAVIGATION SYSTEM....... ONLINE",
    "► ALL SYSTEMS............. NOMINAL",
];

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [visibleLines, setVisibleLines] = useState<number[]>([]);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        // 0.3s: "STARK INDUSTRIES" fades in
        const t1 = setTimeout(() => {
            if (!mountedRef.current) return;
            setStep(1);
        }, 300);
        // 0.8s: "INITIALISING J.A.R.V.I.S..." types
        const t2 = setTimeout(() => {
            if (!mountedRef.current) return;
            setStep(2);
        }, 800);
        // 3.0s: Arc Reactor pulse
        const t3 = setTimeout(() => {
            if (!mountedRef.current) return;
            setStep(3);
        }, 3000);
        // 3.5s: "GOOD DAY, SIR."
        const t4 = setTimeout(() => {
            if (!mountedRef.current) return;
            setStep(4);
        }, 3500);
        // 4.0s: Overlay fades out
        const t5 = setTimeout(() => {
            if (!mountedRef.current) return;
            setIsFadingOut(true);
        }, 4000);
        // 4.5s: Complete
        const t6 = setTimeout(() => {
            if (!mountedRef.current) return;
            onComplete();
        }, 4500);

        return () => {
            [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
        };
    }, [onComplete]);

    // Typing effect for "INITIALISING J.A.R.V.I.S..."
    useEffect(() => {
        if (step === 2) {
            const fullText = "INITIALISING J.A.R.V.I.S...";
            let i = 0;
            const interval = setInterval(() => {
                if (!mountedRef.current) return;
                setTypedText(fullText.slice(0, i + 1));
                i++;
                if (i === fullText.length) {
                    clearInterval(interval);
                    // Start showing lines
                    lines.forEach((_, idx) => {
                        setTimeout(() => {
                            if (!mountedRef.current) return;
                            setVisibleLines(prev => [...prev, idx]);
                        }, (idx + 1) * 150);
                    });
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <div className={`fixed inset-0 z-[100] bg-[#060d18] flex flex-col items-center justify-center font-mono transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>

            {/* Brand Overlay Removed */}
            <div className={`text-[#38bdf8] text-xs tracking-[0.3em] transition-opacity duration-700 mb-8 opacity-0`}>
                &nbsp;
            </div>

            {/* Main Status Text */}
            <div className="w-80 h-48 flex flex-col gap-2">
                <div className="text-white text-sm mb-4 min-h-[1.5em]">
                    {typedText}
                    <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-[#38bdf8]"></span>
                </div>

                <div className="flex flex-col gap-1">
                    {lines.map((text, i) => (
                        <div
                            key={i}
                            className={`text-[#38bdf8]/60 text-[10px] tracking-wider transition-all duration-300 ${visibleLines.includes(i) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                        >
                            {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Arc Reactor UI */}
            <div className={`mt-12 transition-all duration-1000 transform ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <svg width="80" height="80" viewBox="0 0 100 100" className="animate-pulse">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5,3" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />
                    <circle cx="50" cy="50" r="25" fill="#38bdf8" opacity="0.2">
                        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <path d="M50 20 L50 30 M80 50 L70 50 M50 80 L50 70 M20 50 L30 50" stroke="#38bdf8" strokeWidth="2" />
                </svg>
            </div>

            {/* Welcome Greeting */}
            <div className={`mt-8 text-2xl font-bold tracking-tighter transition-all duration-500 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                GOOD DAY, SIR.
            </div>

            {/* Skip Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                }}
                className="fixed bottom-8 right-8 text-[10px] text-white/20 hover:text-[#38bdf8]/50 transition-colors uppercase tracking-[0.2em] border border-white/10 px-4 py-2 rounded-lg z-[101]"
            >
                [ SKIP ]
            </button>

        </div>
    );
};

export default BootSequence;
