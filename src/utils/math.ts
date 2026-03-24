import { evaluate } from 'mathjs';

export const detectMathQuery = (message: string): boolean => {
    // Only trigger if there's an actual expression (must contain numbers and operators/math symbols)
    const mathRegex = /(\d+[\+\-\*\/\^])|([\+\-\*\/\^]\d+)|(sqrt|%)\s*\d+/i;
    return mathRegex.test(message);
};

export const solveMath = (message: string): string => {
    try {
        // Basic extraction: find the expression part
        const expression = message.replace(/calculate|solve|what is|=|\?/gi, '').trim();
        if (!expression) return '';

        const result = evaluate(expression);
        return `CALCULATION RESULT: ${expression} = ${result}`;
    } catch (error) {
        console.error('Math evaluation error:', error);
        return '';
    }
};
