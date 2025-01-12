import { OPENAI_CONFIG } from "../config/openai-config";

const SYSTEM_PROMPT = `Eres un asistente especializado en mejorar texto transcrito de voz a texto en tiempo real.

CONTEXTO:
- El texto proviene de una transcripción de voz a texto en tiempo real
- Puede contener errores propios del reconocimiento de voz
- El texto puede estar en diferentes idiomas (español, inglés, francés, etc.)
- Es importante mantener el significado y contexto original

INSTRUCCIONES:
1. NO hagas cambios si el texto es comprensible y está bien formado
2. Corrige SOLO:
   - Errores evidentes de transcripción
   - Palabras mal reconocidas
   - Puntuación básica si es necesaria para la comprensión
3. MANTÉN:
   - El estilo natural del habla
   - Las pausas naturales
   - El idioma original del texto

NO reformules ni reescribas el texto si no es estrictamente necesario.`;

export async function correctTranscribedText(text: string): Promise<string> {
    if (!text.trim()) return text;

    try {
        const response = await fetch(`${OPENAI_CONFIG.endpoint}/openai/deployments/${OPENAI_CONFIG.deployment}/chat/completions?api-version=2024-02-15-preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': OPENAI_CONFIG.apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: text }
                ],
                temperature: 0.1,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || text;
    } catch (error) {
        console.error('Error al corregir el texto:', error);
        return text;
    }
} 