export const detectCurrencyQuery = (message: string): boolean => {
    const keywords = ['convert', 'exchange rate', 'usd', 'inr', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'cny', 'sek', 'nzd'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
};

export const extractCurrencyParams = (message: string) => {
    const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]{3})\s*(?:to|in)\s*([a-zA-Z]{3})/i;
    const match = message.match(regex);
    if (match) {
        return {
            amount: parseFloat(match[1]),
            from: match[2].toUpperCase(),
            to: match[3].toUpperCase()
        };
    }
    return null;
};

export const fetchCurrency = async (from: string, to: string, amount: number): Promise<string> => {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        if (!response.ok) return '';

        const data = await response.json();
        const rate = data.rates[to];
        if (!rate) return '';

        const result = (amount * rate).toFixed(2);
        return `LIVE RATE: 1 ${from} = ${rate} ${to}. ${amount} ${from} = ${result} ${to}.`;
    } catch (error) {
        console.error('Currency fetch error:', error);
        return '';
    }
};
