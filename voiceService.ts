import type { VoiceSettings } from '@/types';

export class VoiceService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onResultCallback: ((text: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
    }
  }

  // Text to Speech
  async speak(text: string, settings: VoiceSettings): Promise<void> {
    if (!this.synthesis) throw new Error('Speech synthesis not supported');

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speed;
    utterance.volume = settings.volume;
    utterance.pitch = settings.pitch;
    utterance.lang = settings.language;

    const voices = this.synthesis.getVoices();
    if (settings.voice !== 'default') {
      const selectedVoice = voices.find((v) => v.name === settings.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; this.currentUtterance = null; };
    utterance.onerror = () => { this.isSpeaking = false; this.currentUtterance = null; };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  // Speech to Text
  startListening(
    settings: VoiceSettings,
    onResult: (text: string) => void,
    onEnd?: () => void
  ): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = settings.continuousListening;
    this.recognition.interimResults = true;
    this.recognition.lang = settings.language;

    this.onResultCallback = onResult;
    this.onEndCallback = onEnd || null;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && this.onResultCallback) {
        this.onResultCallback(finalTranscript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.isListening = true;
    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Wake word detection (simplified)
  setupWakeWord(wakeWord: string, callback: () => void): void {
    // In a real implementation, use a wake word detection library
    console.log(`Wake word "${wakeWord}" setup (requires wake word detection library)`);
  }
}

export const voiceService = new VoiceService();
