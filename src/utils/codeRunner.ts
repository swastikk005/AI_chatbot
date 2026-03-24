export interface CodeRunResult {
    stdout: string;
    stderr: string;
}

export const detectCodeRunRequest = (message: string): boolean => {
    const keywords = ["run", "execute", "compile", "test this code", "what does this output", "show me the output"];
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
};

export const extractCodeBlock = (message: string): { language: string, code: string } | null => {
    // Try markdown extraction
    const match = message.match(/```(\w+)\n([\s\S]*?)```/);
    if (match) {
        return { language: match[1].toLowerCase(), code: match[2].trim() };
    }

    // Try raw extraction after "run:" or "execute:"
    const rawMatch = message.match(/(?:run|execute|code):\s*([\s\S]+)/i);
    if (rawMatch) {
        return { language: 'javascript', code: rawMatch[1].trim() }; // Default to JS for raw
    }

    return null;
};

const LANGUAGE_MAP: Record<string, string> = {
    'python': 'python',
    'py': 'python',
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'bash': 'bash',
    'sh': 'bash',
    'cpp': 'cpp',
    'c++': 'cpp',
    'java': 'java'
};

export const fetchCodeRun = async (language: string, code: string): Promise<CodeRunResult> => {
    const lang = LANGUAGE_MAP[language] || 'javascript';
    try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: lang,
                version: "*",
                files: [{ name: "main", content: code }]
            })
        });

        if (!response.ok) throw new Error("Execution failed");
        const data = await response.json();

        return {
            stdout: data.run.stdout,
            stderr: data.run.stderr
        };
    } catch (error) {
        console.error(error);
        return {
            stdout: "",
            stderr: "Execution service unavailable, sir."
        };
    }
};
