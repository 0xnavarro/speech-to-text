# Inicio rápido: Reconocimiento y conversión de voz en texto

## Requisitos previos

- Suscripción a Azure (se puede crear una de forma gratuita)
- Recurso de Voz en Azure Portal
- Clave y región del recurso de Voz
- Archivo de audio .wav en el equipo local (hasta 30 segundos) o usar el archivo de ejemplo: https://crbn.us/whatstheweatherlike.wav

## Configuración del entorno

Instalar el SDK de Voz para JavaScript:
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

## Establecimiento de variables de entorno

> **Importante**: Se recomienda la autenticación de Microsoft Entra ID con identidades administradas para los recursos de Azure para evitar almacenar credenciales con sus aplicaciones que se ejecutan en la nube.

### Windows
```bash
setx SPEECH_KEY your-key
setx SPEECH_REGION your-region
```

> **Nota**: Si solo necesita acceder a las variables de entorno en la consola actual, puede establecer la variable de entorno con `set` en vez de `setx`.

## Reconocer la voz a partir de un archivo

1. Crear un archivo `SpeechRecognition.js`
2. Instalar el SDK:
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

3. Código de ejemplo:
```javascript
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

// This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
speechConfig.speechRecognitionLanguage = "en-US";

function fromFile() {
    let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("YourAudioFile.wav"));
    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    speechRecognizer.recognizeOnceAsync(result => {
        switch (result.reason) {
            case sdk.ResultReason.RecognizedSpeech:
                console.log(`RECOGNIZED: Text=${result.text}`);
                break;
            case sdk.ResultReason.NoMatch:
                console.log("NOMATCH: Speech could not be recognized.");
                break;
            case sdk.ResultReason.Canceled:
                const cancellation = sdk.CancellationDetails.fromResult(result);
                console.log(`CANCELED: Reason=${cancellation.reason}`);

                if (cancellation.reason == sdk.CancellationReason.Error) {
                    console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                    console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                    console.log("CANCELED: Did you set the speech resource key and region values?");
                }
                break;
        }
        speechRecognizer.close();
    });
}
fromFile();
```

4. Ejecutar la aplicación:
```bash
node.exe SpeechRecognition.js
```

## Notas importantes

- El ejemplo admite hasta 30 segundos de audio
- Para cambiar el idioma, reemplazar "en-US" por el código deseado (ej: "es-ES" para Español)
- Las variables de entorno SPEECH_KEY y SPEECH_REGION son obligatorias
- El reconocimiento de voz a través de micrófono no está soportado en Node.js, solo en entornos de JavaScript basados en navegador
- Para implementaciones con micrófono, consultar el ejemplo de React en GitHub

## Salida esperada

```
RECOGNIZED: Text=I'm excited to try speech to text.
``` 