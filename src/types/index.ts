export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    imageUrl?: string;
    isLoading?: boolean;
    terminalOutput?: {
        stdout: string;
        stderr: string;
    };
}
