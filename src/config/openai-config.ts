export const OPENAI_CONFIG = {
    apiKey: import.meta.env.VITE_AZURE_OPENAI_KEY || '',
    endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
    deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || ''
} as const; 