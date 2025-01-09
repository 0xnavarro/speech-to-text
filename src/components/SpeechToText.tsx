/* cSpell:disable */
import { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from '../config/azure-config';
import IconoAtenea from '/Icono.svg';
/* cSpell:enable */

// Main Container and Layout Components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(135, 114, 61, 0.15);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(135, 114, 61, 0.2);

  img {
    width: 40px;
    height: 40px;
  }

  h1 {
    color: #87723D;
    margin: 0;
    font-size: 1.5rem;
  }
`;

// Recording and Transcription Components
const TranscriptionArea = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  min-height: 200px;
  border: 1px solid rgba(135, 114, 61, 0.3);
  border-radius: 5px;
  background: #f9f9f9;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

const Button = styled.button<{ $isRecording?: boolean }>`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: ${props => props.$isRecording ? '#ff4444' : '#87723D'};
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => props.$isRecording ? '#ff6666' : '#9a835c'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CopyButton = styled(Button)`
  position: relative;
  overflow: hidden;

  &::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.3s ease;
  }

  &.copied {
    background: #87723D;
    pointer-events: none;

    span {
      transform: translateY(-100%);
      opacity: 0;
    }

    &::after {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  span {
    display: inline-block;
    transition: all 0.3s ease;
  }
`;

const StatusIndicator = styled.div<{ $isRecording: boolean }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isRecording ? '#ff4444' : '#87723D'};
  margin-right: 8px;
  animation: ${props => props.$isRecording ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const DetectedLanguageTag = styled.div<{ $isActive: boolean }>`
  display: ${props => props.$isActive ? 'inline-flex' : 'none'};
  align-items: center;
  padding: 0.5rem 1rem;
  background: #87723D;
  color: white;
  border-radius: 20px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &::before {
    content: '🎤';
    margin-right: 8px;
  }
`;

// Social Links and Footer Components
const SocialLinksContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const SocialButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: #87723D;
  color: white;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #9a835c;
  }

  svg {
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    filter: brightness(0) invert(1);
  }
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(135, 114, 61, 0.2);
  color: #87723D;
  font-size: 0.9rem;
`;

// Main Component
export const SpeechToText = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [recognizer, setRecognizer] = useState<speechsdk.SpeechRecognizer | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Recording time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setupRecognizer = useCallback(() => {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      AZURE_CONFIG.speechKey,
      AZURE_CONFIG.speechRegion
    );

    // Set Spanish as primary language
    speechConfig.speechRecognitionLanguage = "es-ES";

    // Configure language detection
    speechConfig.setProperty(
      speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages,
      "es-ES,en-US,fr-FR,de-DE,it-IT,pt-BR"
    );

    // Enable continuous detection
    speechConfig.setProperty(
      speechsdk.PropertyId.SpeechServiceConnection_LanguageIdMode,
      "Continuous"
    );

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const newRecognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    // Handle recognized speech
    newRecognizer.recognized = (_: unknown, e: speechsdk.SpeechRecognitionEventArgs) => {
      if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
        const detectedLanguage = e.result.properties.getProperty(
          speechsdk.PropertyId.SpeechServiceConnection_RecoLanguage
        );
        if (detectedLanguage) {
          setCurrentLanguage(detectedLanguage);
        }
        
        if (e.result.text.trim()) {
          setTranscription(prev => prev + e.result.text + '\n');
          setStreamingText('');
        }
      }
    };

    // Handle ongoing speech recognition
    newRecognizer.recognizing = (_: unknown, e: speechsdk.SpeechRecognitionEventArgs) => {
      if (e.result.reason === speechsdk.ResultReason.RecognizingSpeech) {
        const detectedLanguage = e.result.properties.getProperty(
          speechsdk.PropertyId.SpeechServiceConnection_RecoLanguage
        );
        if (detectedLanguage) {
          setCurrentLanguage(detectedLanguage);
        }
        
        if (e.result.text.trim()) {
          setStreamingText(e.result.text);
        }
      }
    };

    setRecognizer(newRecognizer);
    return newRecognizer;
  }, []);

  useEffect(() => {
    const recognizerInstance = setupRecognizer();
    return () => {
      recognizerInstance.close();
    };
  }, [setupRecognizer]);

  const toggleRecording = async () => {
    if (!recognizer) return;

    if (!isRecording) {
      setTranscription('');
      setCurrentLanguage(null);
      setStreamingText('');
      await recognizer.startContinuousRecognitionAsync();
      setIsRecording(true);
    } else {
      await recognizer.stopContinuousRecognitionAsync();
      setIsRecording(false);
      setCurrentLanguage(null);
      setStreamingText('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'es-ES': 'Detectado: Español',
      'en-US': 'Detected: English',
      'fr-FR': 'Détecté: Français',
      'de-DE': 'Erkannt: Deutsch',
      'it-IT': 'Rilevato: Italiano',
      'pt-BR': 'Detectado: Português'
    };
    return languages[code] || code;
  };

  return (
    <Container>
      <Header>
        <img src={IconoAtenea} alt="Atenea Labs Logo" />
        <h1>Atenea Labs Speech to Text</h1>
      </Header>
      <ButtonGroup>
        <Button 
          onClick={toggleRecording} 
          $isRecording={isRecording}
        >
          <StatusIndicator $isRecording={isRecording} />
          {isRecording ? `Stop Recording (${formatTime(recordingTime)})` : 'Start Recording'}
        </Button>
        <CopyButton 
          onClick={copyToClipboard}
          className={isCopied ? 'copied' : ''}
          disabled={isCopied}
        >
          <span>Copy to Clipboard</span>
        </CopyButton>
      </ButtonGroup>
      {currentLanguage && isRecording && (
        <DetectedLanguageTag $isActive={true}>
          {getLanguageName(currentLanguage)}
        </DetectedLanguageTag>
      )}
      <TranscriptionArea>
        {transcription}
        {streamingText && <span style={{ color: '#666' }}>{streamingText}</span>}
        {!transcription && !streamingText && 'Transcription will appear here...'}
      </TranscriptionArea>
      <SocialLinksContainer>
        <SocialButton 
          href="https://github.com/0xnavarro/speech-to-text" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </SocialButton>
        <SocialButton 
          href="https://www.linkedin.com/in/0xnavarro/" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          LinkedIn
        </SocialButton>
        <SocialButton 
          href="https://www.atenealabs.com" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={IconoAtenea} alt="Atenea Labs" />
          Atenea Labs
        </SocialButton>
      </SocialLinksContainer>
      <Footer>
        Made with ❤️ by Carlos Navarro & Atenea Labs
      </Footer>
    </Container>
  );
}; 