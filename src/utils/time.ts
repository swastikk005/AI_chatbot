export const detectTimeQuery = (message: string): boolean => {
    const keywords = ['time in', 'what time is it in', 'timezone', 'clock in'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
};

const timezoneMap: { [key: string]: string } = {
    'new york': 'America/New_York',
    'london': 'Europe/London',
    'tokyo': 'Asia/Tokyo',
    'dubai': 'Asia/Dubai',
    'san francisco': 'America/Los_Angeles',
    'mumbai': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'berlin': 'Europe/Berlin',
    'paris': 'Europe/Paris',
    'sydney': 'Australia/Sydney',
    'singapore': 'Asia/Singapore',
};

export const fetchTime = async (message: string): Promise<string> => {
    try {
        const lowerMessage = message.toLowerCase();
        let city = '';
        let timezone = '';

        for (const [key, value] of Object.entries(timezoneMap)) {
            if (lowerMessage.includes(key)) {
                city = key.charAt(0).toUpperCase() + key.slice(1);
                timezone = value;
                break;
            }
        }

        if (!timezone) {
            const match = message.match(/(?:in|at)\s+([a-zA-Z\s]+)(?:$|\?|\.)/i);
            if (match) {
                city = match[1].trim();
                // Fallback or attempt to guess timezone if not in map? 
                // For simplicity, we'll use a generic search if not in map, 
                // but the prompt says to map common cities.
                return `I'm sorry, sir, I don't have the timezone mapping for ${city} yet.`;
            }
            return '';
        }

        const response = await fetch(`https://timeapi.io/api/Time/current/zone?timeZone=${timezone}`);
        if (!response.ok) return '';

        const data = await response.json();
        const time = `${data.hour}:${data.minute.toString().padStart(2, '0')}`;

        // Calculate offset from IST (UTC+5:30)
        // For a real app, I'd use a library, but I'll stick to a simple display.
        return `WORLD CLOCK: Current time in ${city}: ${time} (${timezone}).`;
    } catch (error) {
        console.error('Time fetch error:', error);
        return '';
    }
};
