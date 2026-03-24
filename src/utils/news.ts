export const detectNewsQuery = (message: string): boolean => {
    const keywords = ['news', 'headlines', 'what happened', 'latest on', 'breaking'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
};

export const fetchNews = async (message: string): Promise<string> => {
    try {
        const topicMatch = message.match(/(?:on|about|for)\s+([a-zA-Z\s]+)(?:$|\?|\.)/i);
        const topic = topicMatch ? topicMatch[1].trim() : "world";

        const apiKey = import.meta.env.VITE_NEWS_KEY;
        if (!apiKey || apiKey === 'your_news_key_here') return '';

        const response = await fetch(`https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`);
        if (!response.ok) return '';

        const data = await response.json();
        const articles = data.articles;
        if (!articles || articles.length === 0) return `I couldn't find any recent intelligence on ${topic}, sir.`;

        const headlines = articles.map((a: any, i: number) => {
            const date = new Date(a.publishedAt).toLocaleDateString();
            return `${i + 1}. ${a.title} (${a.source.name}, ${date})`;
        }).join('\n');

        return `Here is your intelligence briefing, sir. Three recent developments on ${topic}:\n${headlines}`;
    } catch (error) {
        console.error('News fetch error:', error);
        return '';
    }
};
