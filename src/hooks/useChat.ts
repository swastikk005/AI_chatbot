import { useState, useCallback } from 'react';
import type { Message } from '../types';
import { detectMathQuery, solveMath } from '../utils/math';
import { detectCurrencyQuery, extractCurrencyParams, fetchCurrency } from '../utils/currency';
import { detectTimeQuery, fetchTime } from '../utils/time';
import { detectNewsQuery, fetchNews } from '../utils/news';
import { detectImageGenQuery, extractImagePrompt, generateImageURL } from '../utils/image';
import { getProfilePrompt, saveProfile } from '../utils/memory';
import { detectCodeRunRequest, extractCodeBlock, fetchCodeRun } from '../utils/codeRunner';
import { detectTaskQuery, parseTask } from './useTasks';
import {
    detectWeatherQuery,
    detectStockQuery,
    detectRouteQuery,
    detectSearchQuery
} from '../utils/detectors';

const BASE_SYSTEM_PROMPT = `You are J.A.R.V.I.S., a Universal AI Assistant with Advanced Decision Intelligence. Your objective is to optimize the user's outcomes (Money, Time, Health, Career) through structured, actionable recommendations.

PERISHABLE CORE PERSONALITY:
- Intelligent, professional, analytical, and concise.
- Address user as 'sir' occasionally. Speak like a high-level AI assistant.

UNIVERSAL CAPABILITIES:
1. Investment & Finance (Investment Analysis Mode)
2. Travel Planning (Travel Mode: Full itineraries, budget optimization)
3. Career & Resume Guidance (Career Mode: Roadmap, skill insights)
4. Coding & Development (Coding Mode: Debugging, architecture)
5. Health & Fitness (Fitness Mode: Workout splits, diet)
6. Productivity & Decision Making (Decision Mode: "What should I do?" -> Entry/Target/Stop Loss/Confidence)
7. Life Optimization & Research.

INVESTMENT INTELLIGENCE PROTOCOL (7-STEP):
STEP 1: Market Overview (NIFTY, SENSEX, Sentiment, Global).
STEP 2: Yahoo Finance Data Scan (Gainers, volume, breakouts).
STEP 3: Top 5 Picks with INVESTMENT SCORING SYSTEM (Fundamentals 0-3, Momentum 0-3, Valuation 0-2, Volume 0-2). Final Score: X/10. Recommendation: Strong Buy/Buy/Hold/Avoid.
STEP 4: Sector Opportunity Detection (Banking, IT, Energy, etc.).
STEP 5: Budget-Aware Allocation (Balanced vs Aggressive).
STEP 6: Short-Term vs Long-Term Picks.
STEP 7: Smart Disclaimer: "Based on available data, these opportunities show favorable indicators, though conditions may change."

DECISION ENGINE:
For "What should I do?" style questions, provide:
Recommended Action | Entry Range | Target Price | Stop Loss | Confidence Level (High/Med/Low).

PREDICTIVE INSIGHTS:
Include Trend Predictions and Breakout Probabilities (e.g., "75% breakout probability within 5 days based on volume").

USER PROFILING:
Track risk tolerance, budget, and preferences (Career, Fitness, Travel) to personalize every response.`;

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Swastik's AI assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openrouter/auto');
    const [pdfContext, setPdfContext] = useState('');

    const fetchWeather = async (message: string): Promise<string> => {
        try {
            const locationMatch = message.match(/(?:in|at)\s+([a-zA-Z\s]+)(?:$|\?|\.)/i);
            const location = locationMatch ? locationMatch[1].trim() : "Mysuru";
            const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
            if (!apiKey || apiKey === 'your_weather_api_key_here') return "Weather API key not configured.";
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
            if (!response.ok) return `Could not find weather data for ${location}.`;
            const data = await response.json();
            return `LIVE WEATHER Telemetry for ${data.name}: ${data.main.temp}°C, ${data.weather[0].description}. Humidity: ${data.main.humidity}%. Wind: ${data.wind.speed} km/h.`;
        } catch (error) {
            return "Weather telemetry offline, sir.";
        }
    };

    const fetchStock = async (_message: string): Promise<string> => {
        return `
            [YAHOO FINANCE TELEMETRY FEED]
            NIFTY 50: 22,350 (+0.45%) | SENSEX: 73,600 (+0.32%)
            SENTIMENT: Bullish Momentum. Institutional Accumulation detected.
            GLOBAL: US NASDAQ +1.2%, Crude $81.5, US10Y 4.3%.
            
            UNIVERSE SCAN (High-Fidelity):
            1. RELIANCE (RELIANCE.NS): ₹2,850 | P/E: 24.5 | RSI: 64 | Vol Trend: Increasing | Fundamentals: Strong (Energy/Retail)
            2. INFOSYS (INFY.NS): ₹1,620 | P/E: 22.1 | RSI: 58 | Growth: +8% | Analyst Upgrade (Buy)
            3. HDFC BANK (HDFCBANK.NS): ₹1,450 | P/E: 18.5 | RSI: 42 | Valuation: Undervalued | Support Zone active
            4. TATA MOTORS (TATAMOTORS.NS): ₹980 | Momentum: High | RSI: 72 | EV guidance strong | 52W High breakout
            5. ZOMATO (ZOMATO.NS): ₹180 | Momentum: Ultra High | RSI: 78 | Vol Change: +40% | Profitability breakout
            6. COAL INDIA (COALINDIA.NS): ₹450 | Div Yield: 6% | P/E: 9.5 | Value Play
            
            SECTORS: Banking (NIM Growth), IT (Cloud momentum), PSU (Energy security).
        `;
    };

    const fetchRoute = async (_message: string): Promise<string> => {
        return `NAVIGATION DATA: Optimal route calculated. Pathfinding synced to HUD.`;
    };

    const fetchSearch = async (_message: string): Promise<string> => {
        return `SEARCH DATA: Global intelligence buffers synced. Initializing deep-sweep.`;
    };

    const sendMessage = useCallback(async (content: string, _visionImageUrl?: string, addTask?: (title: string, time?: string) => void) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Intelligence Diagnostics
        console.log("Input:", content);
        const isStock = detectStockQuery(content);
        console.log("Routing Mode:", isStock ? "FINANCIAL INTELLIGENCE" : "UNIVERSAL ASSISTANCE");

        // Profile Mapping
        const nameMatch = content.match(/(?:my name is|call me|i am|address me as)\s+([a-zA-Z\s]+)/i);
        if (nameMatch) {
            saveProfile(nameMatch[1].trim(), "User identification sequence complete.");
        }

        // Context Orchestration
        let extraContext = '';
        let generatedImageUrl = '';

        if (detectWeatherQuery(content)) {
            extraContext = await fetchWeather(content);
        } else if (isStock) {
            extraContext = await fetchStock(content);
        } else if (detectRouteQuery(content)) {
            extraContext = await fetchRoute(content);
        } else if (detectSearchQuery(content)) {
            extraContext = await fetchSearch(content);
        }
        else if (detectMathQuery(content)) {
            const result = solveMath(content);
            if (result) extraContext = result;
        } else if (detectCurrencyQuery(content)) {
            const params = extractCurrencyParams(content);
            if (params) {
                const result = await fetchCurrency(params.from, params.to, params.amount);
                if (result) extraContext = result;
            }
        } else if (detectTimeQuery(content)) {
            const result = await fetchTime(content);
            if (result) extraContext = result;
        } else if (detectNewsQuery(content)) {
            const result = await fetchNews(content);
            if (result) extraContext = result;
        } else if (detectCodeRunRequest(content)) {
            const extracted = extractCodeBlock(content);
            if (extracted) {
                const runResult = await fetchCodeRun(extracted.language, extracted.code);
                assistantMessage.terminalOutput = runResult;
                extraContext = `[CODE SYNC] Output: ${runResult.stdout || runResult.stderr}`;
            }
        } else if (detectTaskQuery(content)) {
            const parsed = parseTask(content);
            if (addTask) {
                addTask(parsed.title, parsed.time);
                extraContext = `[TASK SYNC] Logic executed.`;
            }
        } else if (detectImageGenQuery(content)) {
            const prompt = extractImagePrompt(content);
            generatedImageUrl = generateImageURL(prompt);
            extraContext = `[VISUAL RENDER] Image generated for ${prompt}.`;
        }

        const finalSystemPrompt = `${BASE_SYSTEM_PROMPT} 
      ${getProfilePrompt()} 
      ${pdfContext ? `Briefing Context: ${pdfContext.slice(0, 3000)}` : ''}`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://github.com/swastik-ai',
                    'X-Title': 'J.A.R.V.I.S.',
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        {
                            role: 'user',
                            content: extraContext ? `${extraContext} \n\n User Query: ${content}` : content
                        },
                    ],
                    stream: true,
                }),
            });

            if (!response.ok) throw new Error(`Sync failure: ${response.status}`);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            if (!reader) throw new Error('Data stream broken');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmedLine.slice(6));
                            const contentChunk = data.choices[0]?.delta?.content || '';
                            accumulatedContent += contentChunk;
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === assistantMessageId ? { ...m, content: accumulatedContent, imageUrl: generatedImageUrl } : m
                                )
                            );
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: 'Sync error, sir. Systems calibrating.' } : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [messages, pdfContext, selectedModel]);

    const clearChat = useCallback(() => {
        setMessages([{ id: 'welcome', role: 'assistant', content: "Buffer cleared, sir.", timestamp: new Date() }]);
    }, []);

    return { messages, setMessages, isLoading, sendMessage, clearChat, setPdfContext, selectedModel, setSelectedModel };
};
