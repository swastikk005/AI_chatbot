export interface UserProfile {
    name: string;
    preferences: string;
}

export const loadProfile = (): UserProfile | null => {
    const data = localStorage.getItem('jarvis_user_profile');
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing user profile:', error);
        }
    }
    return null;
};

export const saveProfile = (name: string, preferences: string): void => {
    localStorage.setItem('jarvis_user_profile', JSON.stringify({ name, preferences }));
};

export const forgetProfile = (): void => {
    localStorage.removeItem('jarvis_user_profile');
};

export const getProfilePrompt = (): string => {
    const profile = loadProfile();
    if (profile) {
        return `User profile: Name: ${profile.name}. Preferences: ${profile.preferences}. Address them by name occasionally.`;
    }
    return '';
};
