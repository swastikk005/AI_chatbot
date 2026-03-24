import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('jarvis-muted');
        return saved === 'true';
    });
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        localStorage.setItem('jarvis-muted', isMuted.toString());
    }, [isMuted]);

    const cleanTextForSpeech = (text: string) => {
        const cleaned = text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1')     // Italic
            .replace(/#(.*?)(\n|$)/g, '$1')  // Headers
            .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '') // Remove code blocks entirely
            .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Links
            .replace(/https?:\/\/\S+/g, '')  // Remove URLs
            .replace(/[-*+]\s+/g, '')        // List items
            .replace(/\n/g, ' ')             // Newlines to spaces
            .trim();

        return cleaned.slice(0, 500); // Truncate to 500 chars
    };

    const fallbackTTS = useCallback((text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.85;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google UK English Male') ||
            v.name.includes('Daniel') ||
            v.lang.startsWith('en-GB')
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const speak = useCallback(async (text: string) => {
        if (isMuted || !text) return;
        const cleanedText = cleanTextForSpeech(text);
        fallbackTTS(cleanedText);
    }, [isMuted, fallbackTTS]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            if (next) window.speechSynthesis.cancel();
            return next;
        });
    }, []);

    return { speak, stop, toggleMute, isSpeaking, isMuted, isSynthesizing: false };
};
