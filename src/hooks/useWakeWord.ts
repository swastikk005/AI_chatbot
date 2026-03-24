import { useState, useEffect, useRef, useCallback } from 'react';

const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useWakeWord = () => {
    const [isStandby, setIsStandby] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const isStandbyRef = useRef(false);
    const restartRef = useRef<any>(null);

    const playActivationBeep = () => {
        const ac = new AudioContext();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        gain.gain.value = 0.2;
        osc.frequency.value = 880;
        osc.start();
        setTimeout(() => { osc.frequency.value = 1320; }, 120);
        setTimeout(() => { osc.stop(); ac.close(); }, 280);
    };

    const startRecognition = useCallback((onActivate: () => void) => {
        if (!SR) return;

        // Clean up previous instance
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        recognitionRef.current = rec;

        rec.onresult = (e: any) => {
            const t = Array.from(e.results)
                .map((r: any) => r[0].transcript.toLowerCase())
                .join(' ');

            if (t.includes('hey jarvis') || t.includes('jarvis')) {
                console.log('WAKE WORD DETECTED');
                playActivationBeep();
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 1500);
                onActivate();
                rec.stop();
                // Delay restart to avoid immediate re-trigger
                setTimeout(() => {
                    if (isStandbyRef.current) startRecognition(onActivate);
                }, 1000);
            }
        };

        rec.onerror = (e: any) => {
            console.error('WakeWord Error:', e.error);
            if (e.error === 'no-speech' && isStandbyRef.current) {
                if (restartRef.current) clearTimeout(restartRef.current);
                restartRef.current = setTimeout(() => startRecognition(onActivate), 500);
            }
        };

        rec.onend = () => {
            if (isStandbyRef.current) {
                if (restartRef.current) clearTimeout(restartRef.current);
                restartRef.current = setTimeout(() => startRecognition(onActivate), 300);
            }
        };

        try {
            rec.start();
        } catch (err) {
            console.warn('Recognition start failed:', err);
        }
    }, []);

    const toggleStandby = useCallback((onActivate: () => void) => {
        if (!SR) {
            console.warn('SpeechRecognition not supported in this browser.');
            return;
        }

        if (isStandby) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (restartRef.current) clearTimeout(restartRef.current);
            isStandbyRef.current = false;
            setIsStandby(false);
        } else {
            isStandbyRef.current = true;
            setIsStandby(true);
            startRecognition(onActivate);
        }
    }, [isStandby, startRecognition]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (restartRef.current) clearTimeout(restartRef.current);
        };
    }, []);

    if (!SR) {
        return { isStandby: false, isFlashing: false, toggleStandby: () => { } };
    }

    return { isStandby, isFlashing, toggleStandby };
};
