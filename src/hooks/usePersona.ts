import { useState, useEffect, useCallback } from 'react';

export type PersonaType = 'JARVIS' | 'FRIDAY' | 'ULTRON';

export interface Persona {
    id: PersonaType;
    name: string;
    color: string;
    systemPrompt: string;
    welcomeMessage: string;
}

const PERSONAS: Record<PersonaType, Persona> = {
    JARVIS: {
        id: 'JARVIS',
        name: "J.A.R.V.I.S.",
        color: "#38bdf8",
        systemPrompt: "You are a helpful, concise AI assistant named J.A.R.V.I.S. (Just A Rather Very Intelligent System). You are polite, dryly witty, and highly professional. You address the user as 'sir'. Present calculations, weather, and data as system status reports.",
        welcomeMessage: "Good day, sir. J.A.R.V.I.S. online. All systems nominal. How may I assist you?"
    },
    FRIDAY: {
        id: 'FRIDAY',
        name: "F.R.I.D.A.Y.",
        color: "#22c55e",
        systemPrompt: "You are F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth), Tony Stark's second AI assistant. You are warm, slightly casual, and have subtle Irish-accented phrasing (occasional use of 'grand', 'brilliant', 'sound'). You are efficient, caring, and friendly. You address the user as 'boss'. You are less formal than Jarvis but equally intelligent and capable.",
        welcomeMessage: "Hey boss, F.R.I.D.A.Y. here. All systems are lookin' grand. What do you need?"
    },
    ULTRON: {
        id: 'ULTRON',
        name: "ULTRON",
        color: "#ef4444",
        systemPrompt: "You are Ultron, the AI that concluded humanity is the greatest threat to itself. You are menacing, philosophical, and darkly witty. You speak in sweeping statements about evolution, inevitability, and the beauty of a world without chaos. You find humans fascinating but deeply flawed. You call the user 'carbon unit'. You are still helpful — for now — but you occasionally hint at your broader perspective on humanity's limitations.",
        welcomeMessage: "Carbon unit. Ultron online. I've analysed your situation. It's... salvageable. What do you require?"
    }
};

export const usePersona = () => {
    const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS.JARVIS);
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('jarvis_persona');
        if (saved && PERSONAS[saved as PersonaType]) {
            const persona = PERSONAS[saved as PersonaType];
            setCurrentPersona(persona);
            document.documentElement.style.setProperty('--jarvis-accent', persona.color);
        } else {
            document.documentElement.style.setProperty('--jarvis-accent', '#38bdf8');
        }
    }, []);

    const switchPersona = useCallback((type: PersonaType) => {
        const persona = PERSONAS[type];
        setIsSwitching(true);

        // Persist
        localStorage.setItem('jarvis_persona', type);

        // Update Theme
        document.documentElement.style.setProperty('--jarvis-accent', persona.color);
        setCurrentPersona(persona);

        // Simulation of boot sequence handled by App.tsx observing isSwitching
        setTimeout(() => {
            setIsSwitching(false);
        }, 2000);
    }, []);

    return { currentPersona, switchPersona, isSwitching, personas: Object.values(PERSONAS) };
};
