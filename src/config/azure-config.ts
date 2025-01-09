export const AZURE_CONFIG = {
    speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    speechRegion: import.meta.env.VITE_AZURE_SPEECH_REGION || '',
    endpoint: import.meta.env.VITE_AZURE_ENDPOINT || ''
} as const; 