
export const AZURE_CONFIG = {
    speechKey: process.env.VITE_AZURE_SPEECH_KEY || '',
    speechRegion: process.env.VITE_AZURE_SPEECH_REGION || '',
    endpoint: process.env.VITE_AZURE_ENDPOINT || ''
} as const; 