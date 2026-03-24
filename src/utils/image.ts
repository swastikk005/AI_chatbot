export const detectImageGenQuery = (message: string): boolean => {
    const keywords = ['generate image', 'create image', 'draw', 'make a picture', 'visualise', 'show me a picture of'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
};

export const extractImagePrompt = (message: string): string => {
    const keywords = ['generate image', 'create image', 'draw', 'make a picture', 'visualise', 'show me a picture of'];
    let prompt = message.toLowerCase();
    for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
            prompt = prompt.replace(keyword, '');
            break;
        }
    }
    return prompt.trim();
};

export const generateImageURL = (prompt: string): string => {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
};
