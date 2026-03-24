/**
 * J.A.R.V.I.S. Intelligence Detectors
 * Logic for routing user queries to specific data providers.
 */

export function detectWeatherQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return ['weather', 'temperature', 'rain', 'sunny', 'humid',
        'forecast', 'hot', 'cold', 'celsius', 'climate',
        'outside', 'degrees'].some(w => lower.includes(w));
}

export function detectStockQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return ['stock', 'share', 'shares', 'price', 'invest', 'market',
        'nifty', 'sensex', 'nse', 'bse', 'trading', 'declined',
        'dropped', 'gained', 'rally', 'crypto', 'portfolio', 'mutual fund', 'equities'].some(w => lower.includes(w))
        || /\b[A-Z]{2,5}\b/.test(message);
}

export function detectRouteQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return ['route', 'directions', 'navigate', 'how to get',
        'shortest', 'distance', 'from', 'travel from',
        'get from', 'path to'].some(w => lower.includes(w));
}

export function detectSearchQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return ['news', 'latest', 'today', 'current', 'recent',
        'what happened', 'who is', 'when did', 'search',
        'look up', 'tell me about', '2025', '2026'].some(w => lower.includes(w));
}
